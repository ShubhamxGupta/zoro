import { describe, it, expect } from 'vitest';
import { createDiagnosticDecorations, VSCODE_APP_VERSION } from './index.js';
import type { ExplainableFinding } from '@repo-intel/shared';

describe('VS Code Extension Client Suite', () => {
  it('exports valid extension version', () => {
    expect(VSCODE_APP_VERSION).toBe('0.6.0');
  });

  it('transforms findings into inline diagnostic decorations', () => {
    const finding: ExplainableFinding = {
      findingId: 'f-sec-1',
      agentId: 'SecurityAgent',
      category: 'security',
      severity: 'CRITICAL',
      confidenceScore: 0.98,
      filePath: 'src/auth.ts',
      lineRange: { startLine: 10, endLine: 12 },
      explanation: {
        whatIsWrong: 'SQL Injection',
        whyItMatters: 'Unauthorized access',
        impactedComponents: ['src/auth.ts'],
      },
      evidenceChain: [],
    };

    const decorations = createDiagnosticDecorations([finding]);
    expect(decorations.length).toBe(1);
    expect(decorations[0]?.severity).toBe('error');
    expect(decorations[0]?.message).toContain('[SECURITY] SQL Injection');
  });
});
