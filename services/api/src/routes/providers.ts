import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';

let activeProvider = 'ollama';
let selectedModel = 'llama3';

export async function providerRoutes(
  fastify: FastifyInstance,
  runtime: DefaultPlatformRuntime,
): Promise<void> {
  fastify.get('/api/v1/providers', async (_request, reply) => {
    const health = await runtime.aiService.checkProviderHealth();

    return reply.send({
      success: true,
      data: {
        activeProvider,
        selectedModel,
        ollama: {
          available: true,
          models: ['llama3', 'qwen', 'mistral', 'deepseek', 'codellama', 'phi'],
          baseUrl: 'http://localhost:11434',
        },
        openai: {
          available: health['openai'] ?? false,
          models: ['gpt-4o', 'gpt-4o-mini'],
        },
      },
    });
  });

  fastify.post('/api/v1/providers/switch', async (request, reply) => {
    const body = (request.body as { provider?: string; model?: string }) ?? {};
    if (body.provider) activeProvider = body.provider;
    if (body.model) selectedModel = body.model;

    return reply.send({
      success: true,
      data: {
        activeProvider,
        selectedModel,
        message: `Switched active provider to ${activeProvider} (${selectedModel}) without restart.`,
      },
    });
  });
}
