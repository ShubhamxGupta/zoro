import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';
import { JobScheduler } from '../operations/job-scheduler.js';
import { PlatformCache } from '../operations/platform-cache.js';
import { PerformanceProfiler } from '../operations/performance-profiler.js';
import { HealthDiagnostics } from '../operations/health-diagnostics.js';

const scheduler = new JobScheduler();
const cache = new PlatformCache();
const profiler = new PerformanceProfiler();

export async function operationsRoutes(
  fastify: FastifyInstance,
  _runtime: DefaultPlatformRuntime,
): Promise<void> {
  // GET /api/v1/operations/health
  fastify.get('/api/v1/operations/health', async (_request, reply) => {
    return reply.send({ success: true, data: HealthDiagnostics.getReport() });
  });

  // GET /api/v1/operations/readiness
  fastify.get('/api/v1/operations/readiness', async (_request, reply) => {
    return reply.send({ success: true, data: { ready: true } });
  });

  // GET /api/v1/operations/liveness
  fastify.get('/api/v1/operations/liveness', async (_request, reply) => {
    return reply.send({ success: true, data: { alive: true } });
  });

  // GET /api/v1/operations/jobs
  fastify.get('/api/v1/operations/jobs', async (_request, reply) => {
    return reply.send({ success: true, data: { jobs: scheduler.getJobs() } });
  });

  // GET /api/v1/operations/cache
  fastify.get('/api/v1/operations/cache', async (_request, reply) => {
    return reply.send({ success: true, data: { stats: cache.getStats() } });
  });

  // GET /api/v1/operations/performance
  fastify.get('/api/v1/operations/performance', async (_request, reply) => {
    return reply.send({ success: true, data: { benchmarks: profiler.getBenchmarks() } });
  });

  // GET /api/v1/operations/diagnostics
  fastify.get('/api/v1/operations/diagnostics', async (_request, reply) => {
    return reply.send({ success: true, data: { report: HealthDiagnostics.getReport() } });
  });

  // POST /api/v1/operations/jobs/:id/retry
  fastify.post('/api/v1/operations/jobs/:id/retry', async (request, reply) => {
    const { id } = request.params as { id: string };
    const ok = scheduler.triggerJob(id);
    return reply.send({ success: ok, data: { message: ok ? 'Job triggered.' : 'Job not found.' } });
  });

  // POST /api/v1/operations/cache/clear
  fastify.post('/api/v1/operations/cache/clear', async (_request, reply) => {
    cache.clear();
    return reply.send({ success: true, data: { message: 'Cache cleared successfully.' } });
  });
}
