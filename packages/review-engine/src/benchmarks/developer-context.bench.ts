import { describe, it, expect } from 'vitest';
import type { GitDiff, RetrievalBundle } from '@repo-intel/shared';
import { DeveloperContextEngine } from '../context/developer-context-engine.js';
import { DiffEngine } from '../git/diff-engine.js';

describe('Developer Context Engine Benchmark', () => {
  it('measures diff parsing and DeveloperContext generation latency across 50 changed files', () => {
    const diffEngine = new DiffEngine();
    const contextEngine = new DeveloperContextEngine();

    const diffChunks: string[] = [];
    for (let i = 0; i < 50; i++) {
      diffChunks.push(`diff --git a/src/module_${i}.ts b/src/module_${i}.ts
index 100..200 100644
--- a/src/module_${i}.ts
+++ b/src/module_${i}.ts
@@ -1,5 +1,6 @@
+ export function handleModule_${i}() {}
- export function deprecatedModule_${i}() {}
`);
    }

    const largeDiff = diffChunks.join('\n');

    const startParse = Date.now();
    const structured = diffEngine.parse(largeDiff);
    const parseDuration = Date.now() - startParse;

    expect(structured.changedFiles).toHaveLength(50);
    expect(parseDuration).toBeLessThan(100);

    const mockDiff: GitDiff = {
      rawDiff: largeDiff,
      sourceCommit: 'c1',
      targetCommit: 'c2',
      changedFilesCount: 50,
    };

    const mockBundle: RetrievalBundle = {
      summary: 'Large bundle',
      intent: { category: 'architecture', confidence: 0.9, keywords: ['module'] },
      plan: {
        vectorK: 20,
        maxHops: 2,
        expansionStrategies: ['neighbours'],
        tokenBudget: 4000,
        rankingPolicy: 'standard',
      },
      entities: [],
      files: structured.changedFiles,
      symbols: structured.addedMethods,
      relationships: [],
      evidence: ['Doc 1', 'Doc 2'],
      metadata: {},
      statistics: {
        vectorLatencyMs: 10,
        graphLatencyMs: 10,
        rankingLatencyMs: 0,
        compressionLatencyMs: 5,
        cacheHits: 0,
        entityCount: 50,
        relationshipCount: 0,
        totalDurationMs: 25,
      },
    };

    const startContext = Date.now();
    const ctx = contextEngine.createContext(mockDiff, mockBundle);
    const contextDuration = Date.now() - startContext;

    expect(ctx.diff.changedFiles).toHaveLength(50);
    expect(contextDuration).toBeLessThan(100);
  });
});
