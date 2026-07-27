import type {
  EmbeddingProvider,
  EmbeddingMetadata,
  VectorRecord,
  VectorStore,
} from '@repo-intel/shared';
import type { GraphStore } from '@repo-intel/graph';
import { ContextBuilder } from '../context/context-builder.js';

export class EmbeddingPipeline {
  private readonly contextBuilder: ContextBuilder;

  constructor(
    store: GraphStore,
    private readonly provider: EmbeddingProvider,
    private readonly vectorStore: VectorStore,
  ) {
    this.contextBuilder = new ContextBuilder(store);
  }

  public async buildAndEmbedGraph(graphVersion = 'v1.0.0'): Promise<{ embeddedCount: number }> {
    const contexts = await this.contextBuilder.buildAllContexts();
    let count = 0;

    for (const ctx of contexts) {
      const vector = await this.provider.embed(ctx.text);
      const createdAt = new Date().toISOString();

      const metadata: EmbeddingMetadata = {
        provider: this.provider.model(),
        model: this.provider.model(),
        dimensions: this.provider.dimensions(),
        graphVersion,
        contentHash: `hash::${ctx.node.id}`,
        createdAt,
        entityKind: ctx.node.kind,
        entityId: ctx.node.id,
        label: ctx.node.label,
        language: ctx.node.properties.language as string | undefined,
        repositoryId: ctx.node.properties.repoId as string | undefined,
      };

      const record: VectorRecord = {
        id: ctx.node.id,
        vector,
        metadata: { ...metadata, ...ctx.node.properties },
      };

      await this.vectorStore.upsert(record);
      count++;
    }

    return { embeddedCount: count };
  }
}
