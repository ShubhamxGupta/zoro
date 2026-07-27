import type { FastifyInstance } from 'fastify';
import type { DeveloperContext, PatchPlan } from '@repo-intel/shared';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';

export async function patchRoutes(
  fastify: FastifyInstance,
  runtime: DefaultPlatformRuntime,
): Promise<void> {
  fastify.post('/api/v1/patches/generate', async (request, reply) => {
    const body = (request.body as { targetSymbol?: string }) ?? {};
    const targetSymbol = body.targetSymbol ?? 'UserService';

    const mockPlan: PatchPlan = {
      id: `plan::${Date.now()}`,
      title: `Refactor ${targetSymbol}`,
      rationale: 'Code quality and domain model alignment',
      estimatedComplexity: 'low',
      riskScore: 0.1,
      affectedFiles: ['src/user.ts'],
      affectedSymbols: [targetSymbol as any],
      dependencyImpacts: [],
      createdAt: new Date().toISOString(),
    };

    const mockDevContext: DeveloperContext = {
      diff: {
        rawDiff: `+ export class ${targetSymbol} {}`,
        changedFiles: ['src/user.ts'],
        changedSymbols: [targetSymbol as any],
        addedMethods: [targetSymbol as any],
        removedMethods: [],
        renamedSymbols: [],
        movedFiles: [],
      },
      changedSymbols: [targetSymbol as any],
      impactedSymbols: [],
      dependencies: [],
      affectedArchitecture: [],
      historicalContext: [],
      relatedDocumentation: [],
      relatedTests: [],
      retrievalBundle: {} as any,
      generatedAt: new Date().toISOString(),
    };

    const patchCandidate = await runtime.patchService.generatePatch(mockPlan, mockDevContext);

    return reply.send({
      success: true,
      data: patchCandidate,
    });
  });

  fastify.post('/api/v1/patches/:id/accept', async (request, reply) => {
    const { id } = request.params as { id: string };
    return reply.send({
      success: true,
      data: { id, status: 'accepted', message: 'Patch accepted successfully.' },
    });
  });

  fastify.post('/api/v1/patches/:id/reject', async (request, reply) => {
    const { id } = request.params as { id: string };
    return reply.send({
      success: true,
      data: { id, status: 'rejected', message: 'Patch rejected successfully.' },
    });
  });
}
