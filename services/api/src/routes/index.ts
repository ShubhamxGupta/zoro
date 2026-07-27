import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { healthRoutes } from './health.js';
import { repositoryRoutes } from './repositories.js';
import { reviewRoutes } from './review.js';
import { providerRoutes } from './providers.js';
import { chatRoutes } from './chat.js';
import { patchRoutes } from './patches.js';
import { graphRoutes } from './graph.js';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';

export const apiV1Routes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  const runtime = new DefaultPlatformRuntime();
  await runtime.initialize();

  await fastify.register(healthRoutes);
  await fastify.register(async (f) => repositoryRoutes(f, runtime));
  await fastify.register(async (f) => reviewRoutes(f, runtime));
  await fastify.register(async (f) => providerRoutes(f, runtime));
  await fastify.register(async (f) => chatRoutes(f, runtime));
  await fastify.register(async (f) => patchRoutes(f, runtime));
  await fastify.register(async (f) => graphRoutes(f, runtime));
};
