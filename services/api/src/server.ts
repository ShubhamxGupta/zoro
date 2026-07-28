import fastify, {
  type FastifyInstance,
  type FastifyError,
  type FastifyRequest,
  type FastifyReply,
} from 'fastify';
import { randomUUID } from 'crypto';
import { ErrorCode, logger, LogContextManager } from '@repo-intel/shared';
import { swaggerPlugin } from './plugins/swagger.plugin.js';
import { healthRoutes } from './routes/health.js';
import { apiV1Routes } from './routes/index.js';
import { MetricsCollector } from './observability/metrics-collector.js';

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
  const requestIdHeader = (process.env.REQUEST_ID_HEADER || 'x-request-id').toLowerCase();
  const slowRequestThresholdMs = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || '500', 10);

  const app = fastify({
    logger: false,
    trustProxy: options.trustProxy ?? true,
    genReqId: (req) => {
      const headerReqId = req.headers[requestIdHeader];
      if (typeof headerReqId === 'string' && headerReqId.trim().length > 0) {
        return headerReqId.trim();
      }
      return randomUUID();
    },
  });

  // Register CORS Globally via Fastify Hook to ensure universal Fastify 4/5 compatibility
  app.addHook('onRequest', (request, reply, done) => {
    const origin = (request.headers.origin as string) || '*';
    reply.header('Access-Control-Allow-Origin', origin);
    reply.header('Access-Control-Allow-Credentials', 'true');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-request-id, X-Request-ID, x-workspace-id, x-repository-id, Accept');
    reply.header('Access-Control-Expose-Headers', 'X-Request-ID, x-request-id, Content-Type');

    if (request.method === 'OPTIONS') {
      reply.status(204).send();
      return;
    }
    done();
  });

  // Register Security Headers Hook
  app.addHook('onRequest', (_request, reply, done) => {
    reply.header('X-DNS-Prefetch-Control', 'off');
    reply.header('Frame-Options', 'SAMEORIGIN');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-XSS-Protection', '0');
    done();
  });

  // Register OpenAPI Documentation Specs
  void app.register(swaggerPlugin);

  // Request Correlation Tracing & Context Hook
  app.addHook('onRequest', (request, reply, done) => {
    const startTime = Date.now();
    (request as unknown as Record<string, unknown>)['__startTime'] = startTime;

    const authHeader = request.headers['authorization'];
    const workspaceId = (request.headers['x-workspace-id'] as string) || null;
    const repositoryId = (request.headers['x-repository-id'] as string) || null;

    reply.header('x-request-id', request.id);

    LogContextManager.run(
      {
        requestId: request.id,
        authenticatedUser: authHeader ? 'authenticated_user' : null,
        workspaceId,
        repositoryId,
      },
      () => {
        done();
      },
    );
  });

  // Request Logging & Latency Telemetry Hook
  app.addHook('onResponse', (request, reply, done) => {
    const startTime = (request as unknown as Record<string, unknown>)['__startTime'] as number;
    const durationMs = startTime ? Date.now() - startTime : 0;

    MetricsCollector.recordRequest(request.method, request.url, reply.statusCode, durationMs);

    if (durationMs > slowRequestThresholdMs) {
      logger.warn({
        message: `Slow API Request Detected (${durationMs}ms > ${slowRequestThresholdMs}ms)`,
        service: 'repo-intel-service',
        context: {
          requestId: request.id,
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          durationMs,
        },
      });
    }

    const currentContext = LogContextManager.getContext();

    logger.info({
      message: 'HTTP Request Completed',
      service: 'repo-intel-service',
      context: {
        requestId: request.id,
        method: request.method,
        url: request.url,
        route: request.routeOptions.url,
        statusCode: reply.statusCode,
        responseTimeMs: durationMs,
        clientIp: request.ip,
        userAgent: request.headers['user-agent'] || null,
        authenticatedUser: currentContext.authenticatedUser || null,
        workspaceId: currentContext.workspaceId || null,
        repositoryId: currentContext.repositoryId || null,
        service: 'repo-intel-service',
        component: 'API-Gateway',
      },
    });

    done();
  });

  // Global Centralized Error Handler
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const startTime = (request as unknown as Record<string, unknown>)['__startTime'] as number;
    const durationMs = startTime ? Date.now() - startTime : 0;
    const statusCode = error.statusCode || 500;
    const errorCode = (error as unknown as { code?: string }).code || ErrorCode.INTERNAL_SERVER_ERROR;

    logger.error({
      message: 'API Request Handling Error',
      service: 'repo-intel-service',
      context: {
        requestId: request.id,
        route: request.url,
        method: request.method,
        errorType: error.name,
        statusCode,
        durationMs,
        timestamp: new Date().toISOString(),
        stack: error.stack,
        service: 'repo-intel-service',
        component: 'API-Gateway',
      },
    });

    const errorPayload: StandardErrorResponse = {
      error: {
        code: errorCode || 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred',
        details: (error as unknown as { details?: unknown }).details || null,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    };

    void reply.status(statusCode).send(errorPayload);
  });

  // Custom 404 Route Not Found Handler
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const notFoundPayload: StandardErrorResponse = {
      error: {
        code: ErrorCode.NOT_FOUND,
        message: `Route ${request.method} ${request.url} not found`,
        requestId: request.id,
        timestamp: new Date().toISOString(),
      },
    };

    void reply.status(404).send(notFoundPayload);
  });

  // Register Core Application Routes
  void app.register(healthRoutes);
  void app.register(apiV1Routes, { prefix: '/api/v1' });

  return app;
}
