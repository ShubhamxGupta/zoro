import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';

export async function reviewRoutes(
  fastify: FastifyInstance,
  runtime: DefaultPlatformRuntime,
): Promise<void> {
  fastify.post('/api/v1/review/run', async (_request, reply) => {
    const diff = await runtime.repositoryService.getDiff('HEAD~1', 'HEAD');
    const result = await runtime.reviewService.runReview(diff);

    return reply.send({
      success: true,
      data: {
        sessionId: result.session.id,
        findingsCount: result.findings.length,
        findings: result.findings,
        metrics: result.session.metrics,
      },
    });
  });

  fastify.get('/api/v1/review/stream', async (_request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    reply.raw.write(`data: ${JSON.stringify({ stage: 'Diff Extraction', progress: 25 })}\n\n`);
    await new Promise((r) => setTimeout(r, 100));

    reply.raw.write(
      `data: ${JSON.stringify({ stage: 'GraphRAG Context Retrieval', progress: 60 })}\n\n`,
    );
    await new Promise((r) => setTimeout(r, 100));

    reply.raw.write(
      `data: ${JSON.stringify({ stage: 'Multi-Agent Inspection', progress: 100 })}\n\n`,
    );
    reply.raw.end();
  });
}
