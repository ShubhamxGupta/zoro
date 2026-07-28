import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';
import { RepositoryMemoryStore } from '@repo-intel/review-engine';
import type { FindingFeedback } from '@repo-intel/shared';

const memoryStore = new RepositoryMemoryStore();

export async function memoryRoutes(
  fastify: FastifyInstance,
  _runtime: DefaultPlatformRuntime,
): Promise<void> {
  // GET /api/v1/memory - Retrieve repository memory & historical conventions
  fastify.get('/api/v1/memory', async (_request, reply) => {
    const memory = memoryStore.getMemory();
    return reply.send({
      success: true,
      data: { memory },
    });
  });

  // POST /api/v1/memory/feedback - Submit developer feedback on AI findings
  fastify.post('/api/v1/memory/feedback', async (request, reply) => {
    const body = (request.body as any) ?? {};
    const feedback: FindingFeedback = {
      id: `fb-${Date.now()}`,
      findingId: body.findingId ?? `f-${Date.now()}`,
      agentId: body.agentId ?? 'SecurityAgent',
      rating: body.rating ?? 'USEFUL',
      comment: body.comment ?? 'Good finding',
      submittedAt: new Date().toISOString(),
    };

    memoryStore.addFeedback(feedback);

    return reply.send({
      success: true,
      data: { feedback, message: 'Finding feedback recorded successfully.' },
    });
  });

  // POST /api/v1/memory/dismiss-finding - Mark a false positive finding to suppress in future runs
  fastify.post('/api/v1/memory/dismiss-finding', async (request, reply) => {
    const body = (request.body as any) ?? {};
    const findingId = body.findingId ?? `f-dismissed-${Date.now()}`;
    const reason = body.reason ?? 'FALSE_POSITIVE';

    memoryStore.addFeedback({
      id: `fb-dismiss-${Date.now()}`,
      findingId,
      agentId: body.agentId ?? 'GeneralAgent',
      rating: 'FALSE_POSITIVE',
      comment: `Dismissed by developer: ${reason}`,
      submittedAt: new Date().toISOString(),
    });

    return reply.send({
      success: true,
      data: { findingId, status: 'DISMISSED', message: 'Finding suppressed from future reviews.' },
    });
  });

  // GET /api/v1/memory/hotspots - Retrieve unstable codebase hotspots
  fastify.get('/api/v1/memory/hotspots', async (_request, reply) => {
    const memory = memoryStore.getMemory();
    return reply.send({
      success: true,
      data: { hotspots: memory.hotspots },
    });
  });
}
