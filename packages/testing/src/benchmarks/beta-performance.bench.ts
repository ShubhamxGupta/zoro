import { describe, it, expect } from 'vitest';
import { DefaultPlatformRuntime } from '../../../../services/api/src/runtime/platform-runtime.js';

describe('Beta Release Performance & Latency Benchmark Suite', () => {
  it('benchmarks end-to-end platform latency across indexing, retrieval, review, and patch generation', async () => {
    const runtime = new DefaultPlatformRuntime();
    await runtime.initialize();

    const memBefore = process.memoryUsage().heapUsed;

    // 1. Indexing Speed Benchmark
    const startIdx = Date.now();
    const idxRes = await runtime.execute<{ indexedFiles: number }>('indexRepository', {
      repoPath: '.',
    });
    const idxLatency = Date.now() - startIdx;
    expect(idxRes.indexedFiles).toBeGreaterThan(0);
    expect(idxLatency).toBeLessThan(100);

    // 2. Context Retrieval Latency Benchmark
    const startRet = Date.now();
    const bundle = await runtime.retrievalService.retrieveContext(
      'UserService null pointer safety',
    );
    const retLatency = Date.now() - startRet;
    expect(bundle.summary).toBeDefined();
    expect(retLatency).toBeLessThan(50);

    // 3. AI Review Latency Benchmark
    const startRev = Date.now();
    const diff = await runtime.repositoryService.getDiff('HEAD~1', 'HEAD');
    const reviewRes = await runtime.reviewService.runReview(diff);
    const revLatency = Date.now() - startRev;
    expect(reviewRes.findings.length).toBeGreaterThan(0);
    expect(revLatency).toBeLessThan(200);

    // 4. Patch Generation Latency Benchmark
    const startPatch = Date.now();
    const plan = {
      id: 'bench-plan',
      title: 'Perf Refactor',
      rationale: 'Benchmark measurement',
      estimatedComplexity: 'low' as const,
      riskScore: 0.1,
      affectedFiles: ['src/user.ts'],
      affectedSymbols: ['UserService' as any],
      dependencyImpacts: [],
      createdAt: new Date().toISOString(),
    };
    const devContext = {
      diff: {
        rawDiff: '',
        changedFiles: ['src/user.ts'],
        changedSymbols: ['UserService' as any],
        addedMethods: [],
        removedMethods: [],
        renamedSymbols: [],
        movedFiles: [],
      },
      changedSymbols: ['UserService' as any],
      impactedSymbols: [],
      dependencies: [],
      affectedArchitecture: [],
      historicalContext: [],
      relatedDocumentation: [],
      relatedTests: [],
      retrievalBundle: bundle,
      generatedAt: new Date().toISOString(),
    };
    const candidate = await runtime.patchService.generatePatch(plan, devContext);
    const patchLatency = Date.now() - startPatch;
    expect(candidate.validation.isValid).toBe(true);
    expect(patchLatency).toBeLessThan(100);

    const memAfter = process.memoryUsage().heapUsed;
    const memDeltaMb = Math.round((memAfter - memBefore) / 1024 / 1024);

    expect(memDeltaMb).toBeLessThan(50); // Less than 50MB heap growth during benchmark

    await runtime.shutdown();
  });
});
