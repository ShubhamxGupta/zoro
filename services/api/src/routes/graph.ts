import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';

export async function graphRoutes(
  fastify: FastifyInstance,
  runtime: DefaultPlatformRuntime,
): Promise<void> {
  fastify.get('/api/v1/graph/nodes', async (_request, reply) => {
    const stats = await runtime.graphService.getGraphStats();

    const sampleNodes = [
      { id: 'mod::core', label: 'Core Module', kind: 'MODULE' },
      { id: 'file::user.ts', label: 'user.ts', kind: 'FILE' },
      { id: 'sym::UserService', label: 'UserService', kind: 'CLASS' },
      { id: 'sym::getUser', label: 'getUser', kind: 'FUNCTION' },
    ];

    const sampleEdges = [
      { source: 'mod::core', target: 'file::user.ts', kind: 'CONTAINS' },
      { source: 'file::user.ts', target: 'sym::UserService', kind: 'DEFINES' },
      { source: 'sym::UserService', target: 'sym::getUser', kind: 'CONTAINS' },
    ];

    return reply.send({
      success: true,
      data: {
        stats,
        nodes: sampleNodes,
        edges: sampleEdges,
      },
    });
  });
}
