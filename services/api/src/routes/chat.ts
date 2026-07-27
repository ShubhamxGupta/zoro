import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';

export async function chatRoutes(
  fastify: FastifyInstance,
  runtime: DefaultPlatformRuntime,
): Promise<void> {
  fastify.post('/api/v1/chat/query', async (request, reply) => {
    const body = (request.body as { question?: string; stream?: boolean }) ?? {};
    const question = body.question ?? 'Explain this repository';

    const bundle = await runtime.retrievalService.retrieveContext(question);

    if (body.stream) {
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');

      const text = `This repository is an enterprise-grade AI Code Review Platform built on a graph-aware architecture. Context retrieved for "${question}": ${bundle.summary}`;
      const tokens = text.split(' ');

      for (const token of tokens) {
        reply.raw.write(`data: ${JSON.stringify({ token: token + ' ' })}\n\n`);
        await new Promise((r) => setTimeout(r, 20));
      }

      reply.raw.write(`data: [DONE]\n\n`);
      reply.raw.end();
      return;
    }

    return reply.send({
      success: true,
      data: {
        question,
        answer: `This repository is an enterprise-grade AI Code Review Platform built on a graph-aware architecture. Context retrieved: ${bundle.summary}`,
        retrievalBundle: bundle,
      },
    });
  });
}
