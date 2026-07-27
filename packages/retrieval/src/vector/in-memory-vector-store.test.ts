import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryVectorStore } from './in-memory-vector-store.js';
import type { VectorRecord } from '@repo-intel/shared';

describe('InMemoryVectorStore', () => {
  let store: InMemoryVectorStore;

  beforeEach(() => {
    store = new InMemoryVectorStore();
  });

  it('upserts and searches vectors with cosine similarity and metadata filtering', async () => {
    const rec1: VectorRecord = {
      id: 'node::1',
      vector: [1, 0, 0, 0],
      metadata: {
        provider: 'test',
        model: 'test',
        dimensions: 4,
        graphVersion: 'v1',
        contentHash: 'h1',
        createdAt: new Date().toISOString(),
        entityKind: 'Symbol',
        entityId: 'node::1',
        label: 'UserService',
        language: 'typescript',
      },
    };

    const rec2: VectorRecord = {
      id: 'node::2',
      vector: [0, 1, 0, 0],
      metadata: {
        provider: 'test',
        model: 'test',
        dimensions: 4,
        graphVersion: 'v1',
        contentHash: 'h2',
        createdAt: new Date().toISOString(),
        entityKind: 'Symbol',
        entityId: 'node::2',
        label: 'OrderService',
        language: 'python',
      },
    };

    await store.upsertBatch([rec1, rec2]);

    const results = await store.search({
      vector: [0.9, 0.1, 0, 0],
      k: 2,
    });

    expect(results).toHaveLength(2);
    expect(results[0]?.id).toBe('node::1');
    expect(results[0]?.score).toBeGreaterThan(results[1]?.score ?? 0);

    const filtered = await store.search({
      vector: [0.9, 0.1, 0, 0],
      k: 2,
      filter: { language: 'python' },
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('node::2');
  });
});
