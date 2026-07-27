import { describe, it, expect } from 'vitest';
import type { ReviewSession } from '@repo-intel/shared';
import { InMemoryReviewSessionStore } from './review-session-store.js';

describe('InMemoryReviewSessionStore', () => {
  it('stores, retrieves, lists, and deletes review sessions', async () => {
    const store = new InMemoryReviewSessionStore();

    const session: ReviewSession = {
      id: 'session-123',
      repositoryId: 'repo-zoro',
      branch: 'main',
      commitHash: 'abc1234',
      retrievedContext: {} as any,
      participatingAgents: ['ArchitectureAgent'],
      executionHistory: [{ agent: 'ArchitectureAgent', status: 'success', durationMs: 15 }],
      findings: [],
      patchPlans: [],
      metrics: { totalDurationMs: 15, retrievalLatencyMs: 5, agentCount: 1, findingsCount: 0 },
      createdAt: new Date().toISOString(),
    };

    await store.save(session);

    const fetched = await store.get('session-123');
    expect(fetched?.id).toBe('session-123');

    const list = await store.list('repo-zoro');
    expect(list).toHaveLength(1);

    const deleted = await store.delete('session-123');
    expect(deleted).toBe(true);
  });
});
