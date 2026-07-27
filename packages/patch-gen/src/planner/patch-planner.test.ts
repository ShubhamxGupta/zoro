import { describe, it, expect } from 'vitest';
import type { ExplainableFinding, RetrievalBundle } from '@repo-intel/shared';
import { PatchPlanner } from './patch-planner.js';

describe('PatchPlanner', () => {
  it('generates structured patch plan from review findings and retrieval bundle', () => {
    const planner = new PatchPlanner();

    const findings: ExplainableFinding[] = [
      {
        findingId: 'f1',
        agentId: 'BugDetectionAgent',
        category: 'logic',
        severity: 'HIGH',
        confidenceScore: 0.9,
        filePath: 'src/user.ts',
        lineRange: { startLine: 10, endLine: 10 },
        explanation: {
          whatIsWrong: 'Null pointer dereference',
          whyItMatters: 'Variable x can be null',
          impactedComponents: ['src/user.ts'],
        },
        evidenceChain: [{ description: 'Possible null access', filePath: 'src/user.ts', line: 10 }],
        suggestedFix: { description: 'Add non-null check' },
      },
    ];

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
      files: ['src/user.ts'],
      symbols: ['UserService'],
      relationships: [
        { id: 'r1', kind: 'CALLS', sourceId: 'src/user.ts', targetId: 'src/helper.ts' },
      ],
      evidence: ['const x = null;'],
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

    const plan = planner.createPatchPlan(findings, mockBundle);

    expect(plan.title).toContain('Null pointer dereference');
    expect(plan.affectedFiles).toContain('src/user.ts');
    expect(plan.riskScore).toBeGreaterThan(0);
    expect(plan.dependencyImpacts.length).toBeGreaterThan(0);
  });
});
