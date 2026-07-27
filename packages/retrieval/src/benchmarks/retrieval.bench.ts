import { describe, it, expect } from 'vitest';
import { InMemoryGraphStore } from '@repo-intel/graph';
import { MockEmbeddingProvider } from '../embeddings/mock-embedding-provider.js';
import { InMemoryVectorStore } from '../vector/in-memory-vector-store.js';
import { EmbeddingPipeline } from '../embeddings/embedding-pipeline.js';
import { SemanticSearchEngine } from '../search/semantic-search-engine.js';
import { GraphRAGRetrievalEngine } from '../graphrag/graphrag-retrieval-engine.js';

describe('GraphRAG Retrieval Engine Benchmark', () => {
  it('measures end-to-end retrieval latency across 300 graph entities', async () => {
    const graphStore = new InMemoryGraphStore();
    const provider = new MockEmbeddingProvider();
    const vectorStore = new InMemoryVectorStore();
    const pipeline = new EmbeddingPipeline(graphStore, provider, vectorStore);
    const searchEngine = new SemanticSearchEngine(provider, vectorStore);
    const engine = new GraphRAGRetrievalEngine(graphStore, searchEngine);

    for (let i = 0; i < 300; i++) {
      const node = {
        id: `sym::Symbol_${i}`,
        kind: 'Symbol' as const,
        label: `SymbolEntity_${i}`,
        properties: { kind: 'class', language: 'typescript' },
      };
      await graphStore.addNode(node);
      if (i > 0) {
        await graphStore.addEdge({
          id: `e_${i}`,
          kind: 'CALLS',
          sourceId: `sym::Symbol_${i - 1}`,
          targetId: `sym::Symbol_${i}`,
        });
      }
    }

    await pipeline.buildAndEmbedGraph();

    const start = Date.now();
    const bundle = await engine.retrieve({
      text: 'Find architecture call chain for SymbolEntity_150',
      maxTokens: 3000,
    });
    const duration = Date.now() - start;

    expect(bundle.entities.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(500); // Sub-500ms end-to-end latency
  });
});
