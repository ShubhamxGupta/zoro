import { describe, it, expect } from 'vitest';
import { SyntaxAgent } from './syntax-agent.js';
import { MockAIProvider } from '@repo-intel/ai';
import type { RetrievalBundle } from '@repo-intel/shared';

describe('SyntaxAgent Suite', () => {
  it('detects syntax and style issues cleanly via analyze()', async () => {
    const agent = new SyntaxAgent();
    const mockProvider = new MockAIProvider();
    const bundle = {
      summary: 'syntax check',
      intent: {} as any,
      plan: {} as any,
      entities: [],
      files: ['src/app.ts'],
      symbols: [],
      relationships: [],
      evidence: ['+ var oldVariable = 10;', '+ debugger;'],
      metadata: {},
      statistics: {} as any,
    } satisfies RetrievalBundle;

    const findings = await agent.analyze(bundle, mockProvider);
    expect(agent.name).toBe('SyntaxAgent');
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.category === 'syntax')).toBe(true);
  });
});
