import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { APP_VERSION } from '@repo-intel/shared';

export const swaggerPlugin: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  const openapiSpec = {
    openapi: '3.0.0',
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
  };

  fastify.get('/documentation/json', async (_request, reply) => {
    return reply.send(openapiSpec);
  });

  fastify.get('/documentation', async (_request, reply) => {
    return reply.redirect('/documentation/json');
  });
};
