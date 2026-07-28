import { describe, it, expect } from 'vitest';
import { PerformanceAgent } from './performance-agent.js';
import { MockAIProvider } from '@repo-intel/ai';
import type { RetrievalBundle } from '@repo-intel/shared';

describe('PerformanceAgent Suite', () => {
  it('detects N+1 queries and blocking synchronous I/O operations', async () => {
    const agent = new PerformanceAgent();
    const mockProvider = new MockAIProvider();
    const bundle: RetrievalBundle = {
      summary: 'perf check',
      intent: {} as any,
      plan: {} as any,
      entities: [],
      files: ['src/service.ts'],
      symbols: [],
      relationships: [],
      evidence: ['+ for(let i=0; i<items.length; i++) { await fetchItem(items[i]); }', '+ fs.readFileSync("data.json");'],
      metadata: {},
      statistics: {} as any,
    };

    const findings = await agent.analyze(bundle, mockProvider);
    expect(agent.name).toBe('PerformanceAgent');
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.category === 'performance')).toBe(true);
  });
});
