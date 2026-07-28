import { describe, it, expect } from 'vitest';
import { UnifiedPatchGenerator } from './patch-generator.js';
import type { ExplainableFinding } from '@repo-intel/shared';

describe('UnifiedPatchGenerator Suite', () => {
  it('generates valid unified diff .patch string from ExplainableFinding', () => {
    const finding: ExplainableFinding = {
      findingId: 'f-1',
      agentId: 'SyntaxAgent',
      category: 'syntax',
      severity: 'LOW',
      confidenceScore: 0.95,
      filePath: 'src/util.ts',
      lineRange: { startLine: 2, endLine: 2 },
      explanation: {
        whatIsWrong: 'var keyword',
        whyItMatters: 'deprecated',
        impactedComponents: ['src/util.ts'],
      },
      evidenceChain: [],
      suggestedFix: {
        description: 'use const',
      },
    };

    const originalCode = 'line 1\nvar val = 10;\nline 3';
    const patch = UnifiedPatchGenerator.generatePatch(finding, originalCode);

    expect(patch).toContain('--- a/src/util.ts');
    expect(patch).toContain('+++ b/src/util.ts');
    expect(patch).toContain('FIX: use const');
  });
});
