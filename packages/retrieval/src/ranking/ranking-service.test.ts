import { describe, it, expect } from 'vitest';
import { RankingService } from './ranking-service.js';
import type { SearchResult } from '@repo-intel/shared';

describe('RankingService', () => {
  it('combines vector similarity, lexical relevance, and symbol importance', () => {
    const ranking = new RankingService();

    const results: SearchResult[] = [
      {
        id: '1',
        score: 0.8,
        record: {
          id: '1',
          vector: [1, 0],
          metadata: {
            provider: 'm',
            model: 'm',
            dimensions: 2,
            graphVersion: 'v1',
            contentHash: 'h1',
            createdAt: 'now',
            entityKind: 'Symbol',
            entityId: '1',
            label: 'UserService',
          },
        },
      },
      {
        id: '2',
        score: 0.85,
        record: {
          id: '2',
          vector: [0, 1],
          metadata: {
            provider: 'm',
            model: 'm',
            dimensions: 2,
            graphVersion: 'v1',
            contentHash: 'h2',
            createdAt: 'now',
            entityKind: 'File',
            entityId: '2',
            label: 'helper.ts',
          },
        },
      },
    ];

    const reranked = ranking.rerank(results, 'UserService');
    expect(reranked[0]?.id).toBe('1'); // Exact lexical + symbol importance boost
  });
});
