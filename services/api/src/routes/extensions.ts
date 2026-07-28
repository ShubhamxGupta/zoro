import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';
import { ExtensionManager, SampleSecurityReviewAgentExtension } from '@repo-intel/review-engine';

const extensionManager = new ExtensionManager();

// Register initial sample extension
extensionManager.registerExtension(new SampleSecurityReviewAgentExtension());

export async function extensionRoutes(
  fastify: FastifyInstance,
  _runtime: DefaultPlatformRuntime,
): Promise<void> {
  // GET /api/v1/extensions
  fastify.get('/api/v1/extensions', async (_request, reply) => {
    const list = extensionManager.getAllExtensions().map((ext) => ({
      metadata: ext.metadata,
      isEnabled: ext.isEnabled,
    }));
    return reply.send({ success: true, data: { extensions: list } });
  });

  // GET /api/v1/extensions/:id
  fastify.get('/api/v1/extensions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const ext = extensionManager.getExtension(id);
    if (!ext) {
      return reply.status(404).send({ success: false, error: `Extension [${id}] not found.` });
    }
    return reply.send({
      success: true,
      data: { extension: { metadata: ext.metadata, isEnabled: ext.isEnabled } },
    });
  });

  // POST /api/v1/extensions/load
  fastify.post('/api/v1/extensions/load', async (request, reply) => {
    const body = (request.body as { extensionId?: string }) ?? {};
    if (body.extensionId && body.extensionId === 'sample-security') {
      extensionManager.registerExtension(new SampleSecurityReviewAgentExtension());
    }
    return reply.send({ success: true, data: { message: 'Extension loaded successfully.' } });
  });

  // POST /api/v1/extensions/unload
  fastify.post('/api/v1/extensions/unload', async (request, reply) => {
    const body = (request.body as { extensionId?: string }) ?? {};
    const id = body.extensionId ?? 'org.example.custom-security-agent';
    const ok = await extensionManager.unloadExtension(id);
    return reply.send({
      success: ok,
      data: { message: ok ? 'Extension unloaded.' : 'Failed to unload.' },
    });
  });

  // POST /api/v1/extensions/enable
  fastify.post('/api/v1/extensions/enable', async (request, reply) => {
    const body = (request.body as { extensionId?: string }) ?? {};
    const id = body.extensionId ?? 'org.example.custom-security-agent';
    const ok = extensionManager.enableExtension(id);
    return reply.send({
      success: ok,
      data: { message: ok ? 'Extension enabled.' : 'Extension not found.' },
    });
  });

  // POST /api/v1/extensions/disable
  fastify.post('/api/v1/extensions/disable', async (request, reply) => {
    const body = (request.body as { extensionId?: string }) ?? {};
    const id = body.extensionId ?? 'org.example.custom-security-agent';
    const ok = extensionManager.disableExtension(id);
    return reply.send({
      success: ok,
      data: { message: ok ? 'Extension disabled.' : 'Extension not found.' },
    });
  });

  // GET /api/v1/extensions/logs
  fastify.get('/api/v1/extensions/logs', async (_request, reply) => {
    return reply.send({ success: true, data: { logs: extensionManager.getLogs() } });
  });
}
