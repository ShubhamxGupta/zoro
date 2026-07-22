import fastify, {
  type FastifyInstance,
  type FastifyError,
  type FastifyRequest,
  type FastifyReply,
} from 'fastify';
import { randomUUID } from 'crypto';
import { ErrorCode, logger, logContext } from '@repo-intel/shared';
import { securityPlugin } from './plugins/security.plugin.js';
import { swaggerPlugin } from './plugins/swagger.plugin.js';
import { healthRoutes } from './routes/health.js';
import { apiV1Routes } from './routes/index.js';

export interface ServerOptions {
  logger?: boolean;
  trustProxy?: boolean;
}

export interface StandardErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
    timestamp: string;
  };
}

export function createAppServer(options: ServerOptions = {}): FastifyInstance {
  const app = fastify({
    logger: false, // Uses @repo-intel/shared custom Pino logger
    trustProxy: options.trustProxy ?? true,
    genReqId: (req) => {
      const headerReqId = req.headers['x-request-id'];
      if (typeof headerReqId === 'string' && headerReqId.trim().length > 0) {
        return headerReqId;
      }
      return randomUUID();
    },
  });

  // Register Security Plugins (CORS, Helmet)
  void app.register(securityPlugin);

  // Register OpenAPI Documentation Specs
  void app.register(swaggerPlugin);

  // Request Correlation Tracing Hooks
  app.addHook('onRequest', (request, reply, done) => {
    const requestId = request.id;
    reply.header('x-request-id', requestId);

    logContext.run({ requestId }, () => {
      done();
    });
  });

  app.addHook('onResponse', (request, reply, done) => {
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

  // Register Operational Health Check Route
  void app.register(healthRoutes);

  // Register Versioned API v1 Routes
  void app.register(apiV1Routes, { prefix: '/api/v1' });

  // Custom 404 Handler
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      error: {
        code: ErrorCode.NOT_FOUND,
        message: `Route ${request.method} ${request.url} not found`,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Global Error Handler
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode =
      error.statusCode && error.statusCode >= 400 && error.statusCode < 600
        ? error.statusCode
        : 500;
    const errorCode =
      error.code || (statusCode === 400 ? ErrorCode.BAD_REQUEST : ErrorCode.INTERNAL_SERVER_ERROR);

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

  return app;
}
