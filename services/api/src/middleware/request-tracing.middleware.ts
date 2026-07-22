import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { logger, logContext } from '@repo-intel/shared';

export const requestTracingMiddleware: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.addHook('onRequest', (request, reply, done) => {
    const requestId = request.id;
    reply.header('x-request-id', requestId);

    logContext.run({ requestId }, () => {
      done();
    });
  });

  fastify.addHook('onResponse', (request, reply, done) => {
    const responseTime = reply.elapsedTime;
    logger.info({
      msg: 'HTTP Request Completed',
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTimeMs: Math.round(responseTime * 100) / 100,
      requestId: request.id,
    });
    done();
  });
};
