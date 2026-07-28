import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';
import { ProviderManager } from '@repo-intel/ai';

const providerManager = new ProviderManager();

export async function providerRoutes(
  fastify: FastifyInstance,
  _runtime: DefaultPlatformRuntime,
): Promise<void> {
  // GET /api/v1/providers
  fastify.get('/api/v1/providers', async (_request, reply) => {
    const health = await providerManager.checkAllHealth();
    return reply.send({
      success: true,
      data: {
        activeProvider: providerManager.getActivePlugin().name,
        selectedModel: providerManager.getActiveModel(),
        health,
        ollama: {
          available: true,
          models: ['llama3', 'qwen', 'mistral', 'deepseek', 'codellama', 'phi'],
          baseUrl: 'http://localhost:11434',
        },
        openai: {
          available: true,
          models: ['gpt-4o', 'gpt-4o-mini'],
        },
      },
    });
  });

  // GET /api/v1/providers/models
  fastify.get('/api/v1/providers/models', async (_request, reply) => {
    const models = providerManager.getAllModels();
    return reply.send({
      success: true,
      data: { models },
    });
  });

  // GET /api/v1/providers/health
  fastify.get('/api/v1/providers/health', async (_request, reply) => {
    const health = await providerManager.checkAllHealth();
    return reply.send({
      success: true,
      data: { health },
    });
  });

  // POST /api/v1/providers/test
  fastify.post('/api/v1/providers/test', async (request, reply) => {
    const body = (request.body as { provider?: string }) ?? {};
    const target = body.provider ?? providerManager.getActivePlugin().name;
    const healthList = await providerManager.checkAllHealth();
    const targetHealth = healthList.find((h) => h.provider.toLowerCase() === target.toLowerCase());

    return reply.send({
      success: true,
      data: {
        provider: target,
        isAvailable: targetHealth?.isAvailable ?? false,
        latencyMs: targetHealth?.latencyMs ?? 0,
      },
    });
  });

  // POST /api/v1/providers/switch
  fastify.post('/api/v1/providers/switch', async (request, reply) => {
    const body = (request.body as { provider?: string; model?: string }) ?? {};
    const targetProvider = body.provider ?? 'ollama';
    const targetModel = body.model;

    const switched = await providerManager.switchProvider(targetProvider, targetModel);

    return reply.send({
      success: switched,
      data: {
        activeProvider: providerManager.getActivePlugin().name,
        selectedModel: providerManager.getActiveModel(),
        message: switched
          ? `Switched active provider to ${providerManager.getActivePlugin().name} (${providerManager.getActiveModel()}) without restart.`
          : `Failed to switch provider to ${targetProvider}`,
      },
    });
  });

  // GET /api/v1/providers/capabilities
  fastify.get('/api/v1/providers/capabilities', async (_request, reply) => {
    const capabilities = providerManager.getAllCapabilities();
    return reply.send({
      success: true,
      data: { capabilities },
    });
  });

  // GET /api/v1/providers/usage
  fastify.get('/api/v1/providers/usage', async (_request, reply) => {
    const usage = providerManager.getAllUsage();
    return reply.send({
      success: true,
      data: { usage },
    });
  });
}
