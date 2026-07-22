import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer, type StandardErrorResponse } from './server.js';
import type { HealthResponse } from './routes/health.js';

describe('Fastify REST API Gateway Skeleton', () => {
  describe('GET /healthz', () => {
    test('returns 200 OK with valid system health metrics', async () => {
      const app = createAppServer();
      const response = await app.inject({
        method: 'GET',
        url: '/healthz',
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');

      const payload = response.json<HealthResponse>();
      assert.equal(payload.status, 'ok');
      assert.equal(typeof payload.uptime, 'number');
      assert.equal(payload.version, '0.5.0');
      assert.equal(typeof payload.timestamp, 'string');
      assert.ok(payload.environment);
      await app.close();
    });

    test('returns 200 OK under /api/v1/healthz versioned prefix', async () => {
      const app = createAppServer();
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/healthz',
      });

      assert.equal(response.statusCode, 200);
      const payload = response.json<HealthResponse>();
      assert.equal(payload.status, 'ok');
      await app.close();
    });
  });

  describe('OpenAPI / Swagger Documentation', () => {
    test('serves OpenAPI specification payload at /documentation/json', async () => {
      const app = createAppServer();
      const response = await app.inject({
        method: 'GET',
        url: '/documentation/json',
      });

      assert.equal(response.statusCode, 200);
      const payload = response.json<{ openapi: string; info: { title: string } }>();
      assert.ok(payload.openapi);
      assert.equal(
        payload.info.title,
        'Repository Intelligence & Code Review Platform API Gateway',
      );
      await app.close();
    });

    test('serves Swagger UI HTML page at /documentation', async () => {
      const app = createAppServer();
      const response = await app.inject({
        method: 'GET',
        url: '/documentation',
      });

      assert.ok([200, 302].includes(response.statusCode));
      await app.close();
    });
  });

  describe('Request ID Propagation & Context', () => {
    test('propagates custom x-request-id header when provided', async () => {
      const app = createAppServer();
      const customId = 'test-trace-correlation-id-9999';

      const response = await app.inject({
        method: 'GET',
        url: '/healthz',
        headers: {
          'x-request-id': customId,
        },
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.headers['x-request-id'], customId);
      await app.close();
    });

    test('generates random UUID for x-request-id when omitted', async () => {
      const app = createAppServer();
      const response = await app.inject({
        method: 'GET',
        url: '/healthz',
      });

      assert.equal(response.statusCode, 200);
      const generatedId = String(response.headers['x-request-id'] ?? '');
      assert.ok(generatedId.length > 10);
      await app.close();
    });
  });

  describe('Error Handling & 404 Routing', () => {
    test('returns standardized 404 JSON response for unmatched routes', async () => {
      const app = createAppServer();
      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-endpoint-route',
      });

      assert.equal(response.statusCode, 404);
      const payload = response.json<StandardErrorResponse>();
      assert.equal(payload.error.code, 'NOT_FOUND');
      assert.equal(payload.error.message, 'Route GET /non-existent-endpoint-route not found');
      assert.ok(payload.error.requestId);
      assert.ok(payload.error.timestamp);
      await app.close();
    });

    test('formats uncaught errors using standard error JSON structure', async () => {
      const app = createAppServer();
      // Register a temporary route throwing an error for testing
      app.get('/test-error-trigger', async () => {
        throw new Error('Simulated runtime error');
      });

      const response = await app.inject({
        method: 'GET',
        url: '/test-error-trigger',
      });

      assert.equal(response.statusCode, 500);
      const payload = response.json<StandardErrorResponse>();
      assert.equal(payload.error.code, 'INTERNAL_SERVER_ERROR');
      assert.equal(payload.error.message, 'An unexpected internal error occurred');
      assert.ok(payload.error.requestId);
      assert.ok(payload.error.timestamp);
      await app.close();
    });
  });
});
