import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createAppServer } from '../server.js';
import type { FastifyInstance } from 'fastify';

describe('Fastify REST API Gateway Integration & Verification Suite', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createAppServer();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('verifies GET /api/v1/repositories/status endpoint', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/repositories/status' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('ready');
  });

  it('verifies POST /api/v1/repositories/scan endpoint', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/repositories/scan',
      payload: { repoPath: '.' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.indexedFiles).toBeGreaterThan(0);
  });

  it('verifies POST /api/v1/review/run endpoint', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/review/run' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.findings.length).toBeGreaterThan(0);
  });

  it('verifies GET /api/v1/providers endpoint', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/providers' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.ollama).toBe(true);
  });

  it('verifies POST /api/v1/providers/switch endpoint', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/providers/switch',
      payload: { provider: 'ollama', model: 'llama3' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.activeProvider).toBe('ollama');
  });

  it('verifies POST /api/v1/chat/query endpoint', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/chat/query',
      payload: { query: 'Architecture overview' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.answer).toBeDefined();
  });

  it('verifies POST /api/v1/patches/generate endpoint', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/patches/generate',
      payload: { targetSymbol: 'UserService' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.unifiedDiff).toBeDefined();
  });

  it('verifies GET /api/v1/graph/nodes endpoint', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/graph/nodes' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data.nodes.length).toBeGreaterThan(0);
  });
});
