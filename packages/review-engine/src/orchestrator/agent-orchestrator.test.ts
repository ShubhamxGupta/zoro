import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '@repo-intel/ai';
import type { RetrievalBundle } from '@repo-intel/shared';
import { AgentOrchestrator } from './agent-orchestrator.js';

describe('AgentOrchestrator', () => {
  it('runs specialized review agents in parallel and aggregates findings', async () => {
    const orchestrator = new AgentOrchestrator();
    const provider = new MockAIProvider();

    const mockBundle: RetrievalBundle = {
      summary: 'Test bundle',
      intent: { category: 'bug_investigation', confidence: 0.9, keywords: ['null'] },
      plan: {
        vectorK: 10,
        maxHops: 2,
        expansionStrategies: ['neighbours'],
        tokenBudget: 2000,
        rankingPolicy: 'standard',
      },
      entities: [],
      files: ['src/services/user.ts'],
      symbols: ['UserService'],
      relationships: [],
      evidence: ['const x = null;'],
      metadata: {},
      statistics: {
        vectorLatencyMs: 5,
        graphLatencyMs: 5,
        rankingLatencyMs: 0,
        compressionLatencyMs: 2,
        cacheHits: 0,
        entityCount: 1,
        relationshipCount: 0,
        totalDurationMs: 12,
      },
    };

    const { findings, metrics } = await orchestrator.executeReview(mockBundle, provider);

    expect(metrics.agentCount).toBe(8);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]?.agentId).toBeDefined();
  });
});
