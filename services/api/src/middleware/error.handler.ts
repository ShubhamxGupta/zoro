import type { FastifyError, FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { ErrorCode, logger } from '@repo-intel/shared';

export const errorHandlerMiddleware: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      error: {
        code: ErrorCode.NOT_FOUND,
        message: `Route ${request.method} ${request.url} not found`,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
    const errorCode = error.code || (statusCode === 400 ? ErrorCode.BAD_REQUEST : ErrorCode.INTERNAL_SERVER_ERROR);

    logger.error({
      msg: 'API Request Handling Error',
      error: error.message,
      stack: error.stack,
      statusCode,
      requestId: request.id,
    });

    reply.status(statusCode).send({
      error: {
        code: errorCode,
        message: statusCode === 500 ? 'An unexpected internal error occurred' : error.message,
        details: error.validation ? error.validation : undefined,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });
};
