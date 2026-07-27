import { describe, it, expect } from 'vitest';
import type { DeveloperContext, PatchPlan } from '@repo-intel/shared';
import { PatchGenerationEngine } from '../engine/patch-generation-engine.js';
import { TransformationRegistry } from '../transformations/transformation-registry.js';

describe('Patch Generation Engine Benchmark', () => {
  it('measures transformation latency and patch generation throughput across 100 refactoring iterations', async () => {
    const engine = new PatchGenerationEngine();
    const registry = new TransformationRegistry();

    const sourceCode = `
import { Config } from './config.js';
export class UserService {
  private config: Config;
  public async getUser(id: string) {
    return { id, name: 'Alice' };
  }
}
`;

    const startTransform = Date.now();
    for (let i = 0; i < 100; i++) {
      await registry.execute('transform::rename_symbol', sourceCode, 'UserService', {
        newName: `UserService_${i}`,
      });
    }
    const transformDuration = Date.now() - startTransform;
    expect(transformDuration).toBeLessThan(500); // 100 transformations in < 500ms

    const mockPlan: PatchPlan = {
      id: 'plan-bench',
      title: 'Benchmark Refactoring',
      rationale: 'Latency measurement',
      estimatedComplexity: 'medium',
      riskScore: 0.2,
      affectedFiles: ['src/user.ts'],
      affectedSymbols: [],
      dependencyImpacts: [],
      createdAt: new Date().toISOString(),
    };

    const mockDevContext: DeveloperContext = {
      diff: {
        rawDiff: sourceCode,
        changedFiles: ['src/user.ts'],
        changedSymbols: [],
        addedMethods: ['getUser'],
        removedMethods: [],
        renamedSymbols: [],
        movedFiles: [],
      },
      changedSymbols: [],
      impactedSymbols: [],
      dependencies: [],
      affectedArchitecture: [],
      historicalContext: [],
      relatedDocumentation: [],
      relatedTests: [],
      retrievalBundle: {} as any,
      generatedAt: new Date().toISOString(),
    };

    const startGen = Date.now();
    const patchCandidate = await engine.generatePatch(
      mockPlan,
      mockDevContext,
      'transform::rename_symbol',
      'UserService',
      sourceCode
    );
    const genDuration = Date.now() - startGen;

    expect(patchCandidate.validation.isValid).toBe(true);
    expect(genDuration).toBeLessThan(100);
  });
});
