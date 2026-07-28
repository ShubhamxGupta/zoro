import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { repositoryRoutes } from './repositories.js';
import { reviewRoutes } from './review.js';
import { providerRoutes } from './providers.js';
import { chatRoutes } from './chat.js';
import { patchRoutes } from './patches.js';
import { graphRoutes } from './graph.js';
import { prRoutes } from './pr.js';
import { historyRoutes } from './history.js';
import { extensionRoutes } from './extensions.js';
import { enterpriseRoutes } from './enterprise.js';
import { operationsRoutes } from './operations.js';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';

export const apiV1Routes: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  const runtime = new DefaultPlatformRuntime();
  await runtime.initialize();

  await fastify.register(async (f) => repositoryRoutes(f, runtime));
  await fastify.register(async (f) => reviewRoutes(f, runtime));
  await fastify.register(async (f) => providerRoutes(f, runtime));
  await fastify.register(async (f) => chatRoutes(f, runtime));
  await fastify.register(async (f) => patchRoutes(f, runtime));
  await fastify.register(async (f) => graphRoutes(f, runtime));
  await fastify.register(async (f) => prRoutes(f, runtime));
  await fastify.register(async (f) => historyRoutes(f, runtime));
  await fastify.register(async (f) => extensionRoutes(f, runtime));
  await fastify.register(async (f) => enterpriseRoutes(f, runtime));
  await fastify.register(async (f) => operationsRoutes(f, runtime));
};
