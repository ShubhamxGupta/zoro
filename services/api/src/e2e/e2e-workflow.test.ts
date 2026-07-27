import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';

describe('Beta Release E2E Workflow Validation', () => {
  let runtime: DefaultPlatformRuntime;

  beforeEach(async () => {
    runtime = new DefaultPlatformRuntime();
    await runtime.initialize();
  });

  afterEach(async () => {
    await runtime.shutdown();
  });

  it('validates complete end-to-end code review and patch workflow', async () => {
    // Step 1: Repository Scan & Indexing
    const scanRes = await runtime.execute<{ indexedFiles: number; durationMs: number }>(
      'indexRepository',
      { repoPath: '.' },
    );
    expect(scanRes.indexedFiles).toBeGreaterThan(0);

    // Step 2: Knowledge Graph Inspection
    const graphStats = await runtime.graphService.getGraphStats();
    expect(graphStats.nodeCount).toBeGreaterThanOrEqual(0);

    // Step 3: GraphRAG Context Retrieval
    const bundle = await runtime.retrievalService.retrieveContext(
      'UserService null pointer safety',
    );
    expect(bundle.summary).toBeDefined();

    // Step 4: AI Review Execution
    const diff = await runtime.repositoryService.getDiff('HEAD~1', 'HEAD');
    const { session, findings } = await runtime.reviewService.runReview(diff);
    expect(session.id).toBeDefined();
    expect(findings.length).toBeGreaterThan(0);

    // Step 5: Patch Generation & Simulation
    const plan = {
      id: 'e2e-plan-1',
      title: 'E2E Refactor',
      rationale: 'E2E workflow validation',
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
    expect(candidate.id).toBeDefined();
    expect(candidate.validation.isValid).toBe(true);
    expect(candidate.unifiedDiff).toContain('UserServiceRefactored');

    // Step 6: AI Provider Health Verification
    const health = await runtime.aiService.checkProviderHealth();
    expect(health['mock']).toBe(true);
  });
});
