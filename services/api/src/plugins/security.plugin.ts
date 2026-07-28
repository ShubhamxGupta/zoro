import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

export const securityPlugin: FastifyPluginAsync = async (
  fastify: FastifyInstance,
): Promise<void> => {
  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        cb(null, origin || '*');
        return;
      }
      cb(null, origin);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-request-id',
      'X-Request-ID',
      'x-workspace-id',
      'x-repository-id',
      'Accept',
    ],
    exposedHeaders: ['X-Request-ID', 'x-request-id', 'Content-Type'],
    credentials: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });
};
