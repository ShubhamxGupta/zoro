import { describe, test, expect } from 'vitest';
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

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/json; charset=utf-8');

      const payload = response.json<HealthResponse>();
      expect(payload.status).toBe('ok');
      expect(typeof payload.uptime).toBe('number');
      expect(payload.version).toBe('0.6.0');
      expect(typeof payload.timestamp).toBe('string');
      expect(payload.environment).toBeDefined();
      await app.close();
    });

    test('returns 200 OK under /api/v1/healthz versioned prefix', async () => {
      const app = createAppServer();
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/healthz',
      });

      expect(response.statusCode).toBe(200);
      const payload = response.json<HealthResponse>();
      expect(payload.status).toBe('ok');
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

      expect(response.statusCode).toBe(200);
      const payload = response.json<{ openapi: string; info: { title: string } }>();
      expect(payload.openapi).toBeDefined();
      expect(payload.info.title).toBe('Repository Intelligence & Code Review Platform API Gateway');
      await app.close();
    });

    test('serves Swagger UI HTML page at /documentation', async () => {
      const app = createAppServer();
      const response = await app.inject({
        method: 'GET',
        url: '/documentation',
      });

      expect([200, 302]).toContain(response.statusCode);
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

      expect(response.statusCode).toBe(200);
      expect(response.headers['x-request-id']).toBe(customId);
      await app.close();
    });

    test('generates random UUID for x-request-id when omitted', async () => {
      const app = createAppServer();
      const response = await app.inject({
        method: 'GET',
        url: '/healthz',
      });

      expect(response.statusCode).toBe(200);
      const generatedId = String(response.headers['x-request-id'] ?? '');
      expect(generatedId.length).toBeGreaterThan(10);
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

      expect(response.statusCode).toBe(404);
      const payload = response.json<StandardErrorResponse>();
      expect(payload.error.code).toBe('NOT_FOUND');
      expect(payload.error.message).toBe('Route GET /non-existent-endpoint-route not found');
      expect(payload.error.requestId).toBeDefined();
      expect(payload.error.timestamp).toBeDefined();
      await app.close();
    });

    test('formats uncaught errors using standard error JSON structure', async () => {
      const app = createAppServer();
      app.get('/test-error-trigger', async () => {
        throw new Error('Simulated runtime error');
      });

      const response = await app.inject({
        method: 'GET',
        url: '/test-error-trigger',
      });

      expect(response.statusCode).toBe(500);
      const payload = response.json<StandardErrorResponse>();
      expect(payload.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(payload.error.message).toBe('An unexpected internal error occurred');
      expect(payload.error.requestId).toBeDefined();
      expect(payload.error.timestamp).toBeDefined();
      await app.close();
    });
  });
});
