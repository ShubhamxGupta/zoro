import { describe, it, expect } from 'vitest';
import type { PatchPlan } from '@repo-intel/shared';
import { PatchExplanationEngine } from './patch-explanation-engine.js';

describe('PatchExplanationEngine', () => {
  it('generates structured patch explanation', () => {
    const engine = new PatchExplanationEngine();

    const mockPlan: PatchPlan = {
      id: 'plan-1',
      title: 'Fix Null Access',
      rationale: 'Prevent null pointer exception',
      estimatedComplexity: 'low',
      riskScore: 0.2,
      affectedFiles: ['src/user.ts'],
      affectedSymbols: [],
      dependencyImpacts: [],
      createdAt: new Date().toISOString(),
    };

    const exp = engine.generateExplanation(mockPlan, undefined, 'src/user.ts', ['getUser']);

    expect(exp.problemSummary).toBe('Fix Null Access');
    expect(exp.whyThisChange).toBe('Prevent null pointer exception');
    expect(exp.verificationSteps.length).toBeGreaterThan(0);
  });
});
