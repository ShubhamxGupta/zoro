import { describe, it, expect } from 'vitest';
import { ArchitectureAgent } from './architecture-agent.js';
import { MockAIProvider } from '@repo-intel/ai';
import type { RetrievalBundle } from '@repo-intel/shared';

describe('ArchitectureAgent Suite', () => {
  it('detects architectural layer violations and deep relative import coupling', async () => {
    const agent = new ArchitectureAgent();
    const mockProvider = new MockAIProvider();
    const bundle: RetrievalBundle = {
      summary: 'arch check',
      intent: {} as any,
      plan: {} as any,
      entities: [],
      files: ['src/domain/user.ts'],
      symbols: [],
      relationships: [],
      evidence: ['+ import { InternalDbConnection } from "../../infra/db/connection.js";'],
      metadata: {},
      statistics: {} as any,
    };

    const findings = await agent.analyze(bundle, mockProvider);
    expect(agent.name).toBe('ArchitectureAgent');
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.category === 'architecture')).toBe(true);
  });
});
