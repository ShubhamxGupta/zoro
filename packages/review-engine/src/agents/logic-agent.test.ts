import { describe, it, expect } from 'vitest';
import { LogicAgent } from './logic-agent.js';
import { MockAIProvider } from '@repo-intel/ai';
import type { RetrievalBundle } from '@repo-intel/shared';

describe('LogicAgent Suite', () => {
  it('detects logic flaws, null dereferences, and boundary errors', async () => {
    const agent = new LogicAgent();
    const mockProvider = new MockAIProvider();
    const bundle: RetrievalBundle = {
      summary: 'logic check',
      intent: {} as any,
      plan: {} as any,
      entities: [],
      files: ['src/user.ts'],
      symbols: [],
      relationships: [],
      evidence: ['+ const id = req.body.user.id;', '+ const item = arr[arr.length];'],
      metadata: {},
      statistics: {} as any,
    };

    const findings = await agent.analyze(bundle, mockProvider);
    expect(agent.name).toBe('LogicAgent');
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.category === 'logic')).toBe(true);
  });
});
