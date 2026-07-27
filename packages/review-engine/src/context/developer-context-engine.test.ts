import { describe, it, expect } from 'vitest';
import type { GitDiff, RetrievalBundle } from '@repo-intel/shared';
import { DeveloperContextEngine } from './developer-context-engine.js';

describe('DeveloperContextEngine', () => {
  it('constructs DeveloperContext combining diffs, subgraphs, and bundle metadata', () => {
    const engine = new DeveloperContextEngine();

    const mockDiff: GitDiff = {
      rawDiff: 'diff --git a/src/user.ts b/src/user.ts\n+ function getUser() {}',
      sourceCommit: 'v1.0.0',
      targetCommit: 'v1.1.0',
      changedFilesCount: 1,
    };

    const mockBundle: RetrievalBundle = {
      summary: 'Test bundle',
      intent: { category: 'bug_investigation', confidence: 0.9, keywords: ['user'] },
      plan: {
        vectorK: 10,
        maxHops: 2,
        expansionStrategies: ['neighbours'],
        tokenBudget: 2000,
        rankingPolicy: 'standard',
      },
      entities: [{ id: 'm::1', kind: 'Module', label: 'UserModule', properties: {} }],
      files: ['src/user.ts', 'src/user.test.ts'],
      symbols: ['getUser'],
      relationships: [
        { id: 'r1', kind: 'IMPORTS', sourceId: 'src/user.ts', targetId: 'src/config.ts' },
      ],
      evidence: ['Doc comment for getUser'],
      metadata: {},
      statistics: {
        vectorLatencyMs: 5,
        graphLatencyMs: 5,
        rankingLatencyMs: 0,
        compressionLatencyMs: 2,
        cacheHits: 0,
        entityCount: 1,
        relationshipCount: 1,
        totalDurationMs: 12,
      },
    };

    const ctx = engine.createContext(mockDiff, mockBundle);

    expect(ctx.diff.changedFiles).toContain('src/user.ts');
    expect(ctx.affectedArchitecture).toContain('UserModule');
    expect(ctx.dependencies).toContain('src/config.ts');
    expect(ctx.relatedTests).toContain('src/user.test.ts');
  });
});
