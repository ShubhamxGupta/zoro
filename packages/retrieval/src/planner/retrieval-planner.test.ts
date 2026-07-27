import { describe, it, expect } from 'vitest';
import { DefaultRetrievalPlanner } from './retrieval-planner.js';
import type { QueryIntent } from '@repo-intel/shared';

describe('DefaultRetrievalPlanner', () => {
  it('creates optimized retrieval plans based on query intent categories', () => {
    const planner = new DefaultRetrievalPlanner();

    const bugIntent: QueryIntent = {
      category: 'bug_investigation',
      confidence: 0.9,
      keywords: ['crash'],
    };
    const bugPlan = planner.createPlan(bugIntent, 3000);

    expect(bugPlan.vectorK).toBe(15);
    expect(bugPlan.maxHops).toBe(3);
    expect(bugPlan.expansionStrategies).toContain('call_graph');

    const archIntent: QueryIntent = {
      category: 'architecture',
      confidence: 0.8,
      keywords: ['structure'],
    };
    const archPlan = planner.createPlan(archIntent, 2000);

    expect(archPlan.expansionStrategies).toContain('dependencies');
  });
});
