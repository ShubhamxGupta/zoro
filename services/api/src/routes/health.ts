import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { config } from '@repo-intel/shared';

export interface HealthResponse {
  status: string;
  uptime: number;
  version: string;
  timestamp: string;
  environment: string;
}

export const healthRoutes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  const schema = {
    description: 'System operational health check endpoint',
    tags: ['Health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          uptime: { type: 'number', example: 42.15 },
          version: { type: 'string', example: '0.5.0' },
          timestamp: { type: 'string', format: 'date-time' },
          environment: { type: 'string', example: 'development' },
        },
        required: ['status', 'uptime', 'version', 'timestamp', 'environment'],
      },
    },
  };

  const healthHandler = async () => {
    const payload: HealthResponse = {
      status: 'ok',
      uptime: process.uptime(),
      version: '0.5.0',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
    };
    return payload;
  };

  fastify.get('/healthz', { schema }, healthHandler);
};
