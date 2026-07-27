import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGraphStore } from '@repo-intel/graph';
import { MockEmbeddingProvider } from '../embeddings/mock-embedding-provider.js';
import { InMemoryVectorStore } from '../vector/in-memory-vector-store.js';
import { EmbeddingPipeline } from '../embeddings/embedding-pipeline.js';
import { SemanticSearchEngine } from '../search/semantic-search-engine.js';
import { GraphRAGRetrievalEngine } from './graphrag-retrieval-engine.js';

describe('GraphRAGRetrievalEngine', () => {
  let graphStore: InMemoryGraphStore;
  let provider: MockEmbeddingProvider;
  let vectorStore: InMemoryVectorStore;
  let pipeline: EmbeddingPipeline;
  let searchEngine: SemanticSearchEngine;
  let engine: GraphRAGRetrievalEngine;

  beforeEach(async () => {
    graphStore = new InMemoryGraphStore();
    provider = new MockEmbeddingProvider();
    vectorStore = new InMemoryVectorStore();
    pipeline = new EmbeddingPipeline(graphStore, provider, vectorStore);
    searchEngine = new SemanticSearchEngine(provider, vectorStore);
    engine = new GraphRAGRetrievalEngine(graphStore, searchEngine);

    await graphStore.addNode({
      id: 'sym::UserService',
      kind: 'Symbol',
      label: 'UserService',
      properties: { kind: 'class', language: 'typescript' },
    });
    await graphStore.addNode({
      id: 'sym::saveUser',
      kind: 'Symbol',
      label: 'saveUser',
      properties: { kind: 'method' },
    });
    await graphStore.addEdge({
      id: 'e1',
      kind: 'CONTAINS',
      sourceId: 'sym::UserService',
      targetId: 'sym::saveUser',
    });

    await pipeline.buildAndEmbedGraph();
  });

  it('executes end-to-end retrieval producing structured RetrievalBundle payloads', async () => {
    const bundle = await engine.retrieve({
      text: 'How to fix null crash in UserService saveUser?',
      maxTokens: 2000,
    });

    expect(bundle.intent.category).toBe('bug_investigation');
    expect(bundle.entities.length).toBeGreaterThan(0);
    expect(bundle.evidence.length).toBeGreaterThan(0);
    expect(bundle.statistics.totalDurationMs).toBeGreaterThanOrEqual(0);
    expect(bundle.summary).toContain('bug_investigation');
  });
});
