import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { healthRoutes } from './health.js';

export const apiV1Routes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  // Register v1 sub-routes
  await fastify.register(healthRoutes);
};
