import { describe, it, expect } from 'vitest';
import type { GitDiff, RetrievalBundle, RetrievalPipeline } from '@repo-intel/shared';
import { MockAIProvider } from '@repo-intel/ai';
import { IncrementalReviewEngine } from './incremental-review-engine.js';

describe('IncrementalReviewEngine', () => {
  it('executes scoped incremental AI review for changed files and symbols', async () => {
    const mockPipeline: RetrievalPipeline = {
      async retrieve(): Promise<RetrievalBundle> {
        return {
          summary: 'Incremental bundle',
          intent: { category: 'general_search', confidence: 0.8, keywords: ['getUser'] },
          plan: {
            vectorK: 5,
            maxHops: 1,
            expansionStrategies: ['neighbours'],
            tokenBudget: 1500,
            rankingPolicy: 'standard',
          },
          entities: [],
          files: ['src/user.ts'],
          symbols: ['getUser'],
          relationships: [],
          evidence: ['const getUser = () => {};'],
          metadata: {},
          statistics: {
            vectorLatencyMs: 2,
            graphLatencyMs: 2,
            rankingLatencyMs: 0,
            compressionLatencyMs: 1,
            cacheHits: 0,
            entityCount: 1,
            relationshipCount: 0,
            totalDurationMs: 5,
          },
        };
      },
    };

    const engine = new IncrementalReviewEngine(mockPipeline);
    const provider = new MockAIProvider();

    const mockDiff: GitDiff = {
      rawDiff: 'diff --git a/src/user.ts b/src/user.ts\n+ function getUser() {}',
      sourceCommit: 'c1',
      targetCommit: 'c2',
      changedFilesCount: 1,
    };

    const { findings, changedFilesCount, durationMs } = await engine.reviewIncremental(
      mockDiff,
      provider,
    );

    expect(changedFilesCount).toBe(1);
    expect(findings.length).toBeGreaterThan(0);
    expect(durationMs).toBeGreaterThanOrEqual(0);
  });
});
