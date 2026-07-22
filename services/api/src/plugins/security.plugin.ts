import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

export const securityPlugin: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Disabled for swagger UI compatibility
  });
};
