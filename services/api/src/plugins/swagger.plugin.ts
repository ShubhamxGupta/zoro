import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { APP_VERSION } from '@repo-intel/shared';

export const swaggerPlugin: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Repository Intelligence & Code Review Platform API Gateway',
        description:
          'REST API Gateway providing high-throughput access to analysis services, graph subgraphs, and AI multi-agent reviews.',
        version: APP_VERSION,
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

  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
};
