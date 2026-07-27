import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGraphStore } from '@repo-intel/graph';
import { MockEmbeddingProvider } from '../embeddings/mock-embedding-provider.js';
import { InMemoryVectorStore } from '../vector/in-memory-vector-store.js';
import { EmbeddingPipeline } from '../embeddings/embedding-pipeline.js';
import { SemanticSearchEngine } from './semantic-search-engine.js';

describe('SemanticSearchEngine', () => {
  let graphStore: InMemoryGraphStore;
  let provider: MockEmbeddingProvider;
  let vectorStore: InMemoryVectorStore;
  let pipeline: EmbeddingPipeline;
  let searchEngine: SemanticSearchEngine;

  beforeEach(async () => {
    graphStore = new InMemoryGraphStore();
    provider = new MockEmbeddingProvider();
    vectorStore = new InMemoryVectorStore();
    pipeline = new EmbeddingPipeline(graphStore, provider, vectorStore);
    searchEngine = new SemanticSearchEngine(provider, vectorStore);

    await graphStore.addNode({
      id: 'sym::UserService',
      kind: 'Symbol',
      label: 'UserService',
      properties: { kind: 'class', language: 'typescript' },
    });
    await graphStore.addNode({
      id: 'sym::OrderService',
      kind: 'Symbol',
      label: 'OrderService',
      properties: { kind: 'class', language: 'python' },
    });

    await pipeline.buildAndEmbedGraph();
  });

  it('performs vector search with top-k scoring and metadata filters', async () => {
    const results = await searchEngine.searchVector('UserService', 2);

    expect(results).toHaveLength(2);
    expect(results[0]?.record.metadata.label).toBe('UserService');

    const filtered = await searchEngine.searchVector('Service', 2, { language: 'python' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.record.metadata.label).toBe('OrderService');
  });
});
