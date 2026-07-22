import fastify, {
  type FastifyInstance,
  type FastifyError,
  type FastifyRequest,
  type FastifyReply,
} from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { randomUUID } from 'crypto';
import { logger, logContext } from '@repo-intel/shared';
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
    logger: false, // We use @repo-intel/shared custom Pino logger
    trustProxy: options.trustProxy ?? true,
    genReqId: (req) => {
      const headerReqId = req.headers['x-request-id'];
      if (typeof headerReqId === 'string' && headerReqId.trim().length > 0) {
        return headerReqId;
      }
      return randomUUID();
    },
  });

  // Register Security & Infrastructure Plugins
  app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  });

  app.register(helmet, {
    contentSecurityPolicy: false, // Disabled for swagger UI compatibility
  });

  // Register OpenAPI Documentation Specs
  app.register(swagger, {
    openapi: {
      info: {
        title: 'Repository Intelligence & Code Review Platform API Gateway',
        description:
          'REST API Gateway providing high-throughput access to analysis services, graph subgraphs, and AI multi-agent reviews.',
        version: '0.5.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local Development Server',
        },
      ],
      tags: [
        { name: 'Health', description: 'System health monitoring endpoints' },
        { name: 'Review', description: 'Code review execution & finding management' },
      ],
    },
  });

  app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Request Tracking Hook & Context Propagation
  app.addHook('onRequest', (request, reply, done) => {
    const requestId = request.id;
    reply.header('x-request-id', requestId);

    // Bind request correlation context using AsyncLocalStorage
    logContext.run({ requestId }, () => {
      done();
    });
  });

  // Request Completion Log Hook
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

  // Root Health Endpoint
  app.register(healthRoutes);

  // Versioned API v1 Router
  app.register(apiV1Routes, { prefix: '/api/v1' });

  // Custom 404 Handler
  app.setNotFoundHandler((request, reply) => {
    const responsePayload: StandardErrorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    };
    reply.status(404).send(responsePayload);
  });

  // Global Error Handler
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode =
      error.statusCode && error.statusCode >= 400 && error.statusCode < 600
        ? error.statusCode
        : 500;
    const errorCode = error.code || (statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR');

    logger.error({
      msg: 'API Request Handling Error',
      error: error.message,
      stack: error.stack,
      statusCode,
      requestId: request.id,
    });

    const responsePayload: StandardErrorResponse = {
      error: {
        code: errorCode,
        message: statusCode === 500 ? 'An unexpected internal error occurred' : error.message,
        details: error.validation ? error.validation : undefined,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    };

    reply.status(statusCode).send(responsePayload);
  });

  return app;
}
