import { describe, it, expect } from 'vitest';
import type { DeveloperContext, PatchPlan } from '@repo-intel/shared';
import { PatchGenerationEngine } from './patch-generation-engine.js';

describe('PatchGenerationEngine', () => {
  it('simulates AST refactoring and generates PatchCandidate with unified diff and validation', async () => {
    const engine = new PatchGenerationEngine();

    const mockPlan: PatchPlan = {
      id: 'plan-123',
      title: 'Rename UserService to UserAccountService',
      rationale: 'Domain model refactoring',
      estimatedComplexity: 'low',
      riskScore: 0.1,
      affectedFiles: ['src/user.ts'],
      affectedSymbols: [],
      dependencyImpacts: [],
      createdAt: new Date().toISOString(),
    };

    const mockDevContext: DeveloperContext = {
      diff: {
        rawDiff: '+ export class UserService {}',
        changedFiles: ['src/user.ts'],
        changedSymbols: [],
        addedMethods: ['UserService'],
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

    const patchCandidate = await engine.generatePatch(
      mockPlan,
      mockDevContext,
      'transform::rename_symbol',
      'UserService',
      'export class UserService {}\n',
    );

    expect(patchCandidate.unifiedDiff).toContain('UserServiceRefactored');
    expect(patchCandidate.validation.isValid).toBe(true);
    expect(patchCandidate.explanation.affectedSymbols).toContain('UserServiceRefactored');
  });
});
