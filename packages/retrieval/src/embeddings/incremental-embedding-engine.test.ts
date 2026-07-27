import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGraphStore } from '@repo-intel/graph';
import { MockEmbeddingProvider } from './mock-embedding-provider.js';
import { InMemoryVectorStore } from '../vector/in-memory-vector-store.js';
import { IncrementalEmbeddingEngine } from './incremental-embedding-engine.js';

describe('IncrementalEmbeddingEngine', () => {
  let graphStore: InMemoryGraphStore;
  let provider: MockEmbeddingProvider;
  let vectorStore: InMemoryVectorStore;
  let engine: IncrementalEmbeddingEngine;

  beforeEach(() => {
    graphStore = new InMemoryGraphStore();
    provider = new MockEmbeddingProvider();
    vectorStore = new InMemoryVectorStore();
    engine = new IncrementalEmbeddingEngine(graphStore, provider, vectorStore);
  });

  it('updates vectors only for affected graph entities and removes deleted entities', async () => {
    await graphStore.addNode({
      id: 'node::1',
      kind: 'Symbol',
      label: 'UserService',
      properties: { kind: 'class' },
    });
    await graphStore.addNode({
      id: 'node::2',
      kind: 'Symbol',
      label: 'OrderService',
      properties: { kind: 'class' },
    });

    await engine.updateEmbeddingsForEntities(['node::1', 'node::2']);

    const rec1 = await vectorStore.get('node::1');
    expect(rec1).toBeDefined();

    // Delete node::2 from graph and update
    await graphStore.removeNode('node::2');
    await engine.updateEmbeddingsForEntities(['node::2']);

    const rec2 = await vectorStore.get('node::2');
    expect(rec2).toBeUndefined();
  });
});
