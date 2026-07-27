import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { APP_VERSION, SYSTEM_HEALTH_OK, config } from '@repo-intel/shared';

export type HealthCheckStatus = 'ok' | 'degraded' | 'down';

export interface ComponentHealth {
  status: HealthCheckStatus;
  details?: Record<string, unknown>;
}

export type HealthCheckFn = () => Promise<ComponentHealth>;

const healthCheckRegistry: Map<string, HealthCheckFn> = new Map();

export function registerHealthCheck(name: string, checkFn: HealthCheckFn): void {
  healthCheckRegistry.set(name, checkFn);
}

export interface HealthResponse {
  status: HealthCheckStatus;
  uptime: number;
  version: string;
  timestamp: string;
  environment: string;
  dependencies?: Record<string, ComponentHealth>;
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
          version: { type: 'string', example: '0.6.0' },
          timestamp: { type: 'string', format: 'date-time' },
          environment: { type: 'string', example: 'development' },
        },
        required: ['status', 'uptime', 'version', 'timestamp', 'environment'],
      },
    },
  };

  const healthHandler = async (): Promise<HealthResponse> => {
    let overallStatus: HealthCheckStatus = SYSTEM_HEALTH_OK;
    const dependencyResults: Record<string, ComponentHealth> = {};

    for (const [name, checkFn] of healthCheckRegistry.entries()) {
      try {
        const result = await checkFn();
        dependencyResults[name] = result;
        if (result.status === 'down') {
          overallStatus = 'down';
        } else if (result.status === 'degraded' && overallStatus !== 'down') {
          overallStatus = 'degraded';
        }
      } catch (err) {
        dependencyResults[name] = {
          status: 'down',
          details: { error: (err as Error).message },
        };
        overallStatus = 'down';
      }
    }

    return {
      status: overallStatus,
      uptime: process.uptime(),
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      dependencies: Object.keys(dependencyResults).length > 0 ? dependencyResults : undefined,
    };
  };

  fastify.get('/healthz', { schema }, healthHandler);
  fastify.get('/api/v1/healthz', { schema }, healthHandler);
};
