import { describe, it, expect } from 'vitest';
import { FindingDeduplicator } from './finding-deduplicator.js';
import { FindingAggregator } from './finding-aggregator.js';
import type { ExplainableFinding } from '@repo-intel/shared';

describe('Finding Aggregator & Deduplicator Suite', () => {
  const finding1: ExplainableFinding = {
    findingId: 'f-1',
    agentId: 'SecurityAgent',
    category: 'security',
    severity: 'HIGH',
    confidenceScore: 0.85,
    filePath: 'src/user.ts',
    lineRange: { startLine: 10, endLine: 20 },
    explanation: {
      whatIsWrong: 'SQL Injection',
      whyItMatters: 'Security leak',
      impactedComponents: ['UserService'],
    },
    evidenceChain: [],
  };

  const finding2: ExplainableFinding = {
    findingId: 'f-2',
    agentId: 'LogicAgent',
    category: 'security',
    severity: 'CRITICAL',
    confidenceScore: 0.95,
    filePath: 'src/user.ts',
    lineRange: { startLine: 15, endLine: 25 },
    explanation: {
      whatIsWrong: 'Unchecked raw query',
      whyItMatters: 'Database exploit',
      impactedComponents: ['DatabaseLayer'],
    },
    evidenceChain: [],
  };

  const finding3: ExplainableFinding = {
    findingId: 'f-3',
    agentId: 'PerfAgent',
    category: 'performance',
    severity: 'LOW',
    confidenceScore: 0.7,
    filePath: 'src/user.ts',
    lineRange: { startLine: 100, endLine: 105 },
    explanation: {
      whatIsWrong: 'N+1 Query',
      whyItMatters: 'Slow runtime',
      impactedComponents: [],
    },
    evidenceChain: [],
  };

  it('deduplicates overlapping line findings for same file and category', () => {
    const deduplicated = FindingDeduplicator.deduplicate([finding1, finding2]);
    expect(deduplicated.length).toBe(1);
    expect(deduplicated[0]?.explanation.whatIsWrong).toContain('Merged:');
    expect(deduplicated[0]?.confidenceScore).toBe(0.95);
  });

  it('aggregates multi-agent findings and ranks strictly by severity and confidence', () => {
    const aggregated = FindingAggregator.aggregate([[finding1], [finding2, finding3]]);
    expect(aggregated.length).toBe(2);
    expect(aggregated[0]?.category).toBe('security');
    expect(aggregated[1]?.category).toBe('performance');
  });
});
