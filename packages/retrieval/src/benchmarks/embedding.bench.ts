import { describe, it, expect } from 'vitest';
import { InMemoryGraphStore } from '@repo-intel/graph';
import { MockEmbeddingProvider } from '../embeddings/mock-embedding-provider.js';
import { InMemoryVectorStore } from '../vector/in-memory-vector-store.js';
import { EmbeddingPipeline } from '../embeddings/embedding-pipeline.js';
import { SemanticSearchEngine } from '../search/semantic-search-engine.js';

describe('Embedding & Semantic Search Benchmark', () => {
  it('measures embedding pipeline throughput and search latency over 200 entities', async () => {
    const graphStore = new InMemoryGraphStore();
    const provider = new MockEmbeddingProvider();
    const vectorStore = new InMemoryVectorStore();
    const pipeline = new EmbeddingPipeline(graphStore, provider, vectorStore);
    const searchEngine = new SemanticSearchEngine(provider, vectorStore);

    for (let i = 0; i < 200; i++) {
      await graphStore.addNode({
        id: `sym::Entity_${i}`,
        kind: 'Symbol',
        label: `ServiceEntity_${i}`,
        properties: {
          kind: i % 2 === 0 ? 'class' : 'method',
          language: i % 2 === 0 ? 'typescript' : 'python',
        },
      });
    }

    const embedStart = Date.now();
    const { embeddedCount } = await pipeline.buildAndEmbedGraph();
    const embedDuration = Date.now() - embedStart;

    expect(embeddedCount).toBe(200);
    expect(embedDuration).toBeLessThan(1000); // Under 1 second

    const searchStart = Date.now();
    const results = await searchEngine.searchVector('ServiceEntity_50', 10);
    const searchDuration = Date.now() - searchStart;

    expect(results.length).toBeGreaterThan(0);
    expect(searchDuration).toBeLessThan(100); // Under 100ms search latency
  });
});
