import type { GraphStore } from '@repo-intel/graph';
import type {
  RetrievalBundle,
  RetrievalMetrics,
  RetrievalPipeline,
  RetrievalQuery,
} from '@repo-intel/shared';
import { QueryAnalyzer } from '../query/query-analyzer.js';
import { DefaultRetrievalPlanner } from '../planner/retrieval-planner.js';
import { SemanticSearchEngine } from '../search/semantic-search-engine.js';
import { GraphExpander } from '../expansion/graph-expander.js';
import { ContextCompressor } from '../compression/context-compressor.js';

export class GraphRAGRetrievalEngine implements RetrievalPipeline {
  private readonly analyzer: QueryAnalyzer;
  private readonly planner: DefaultRetrievalPlanner;
  private readonly expander: GraphExpander;
  private readonly compressor: ContextCompressor;

  constructor(
    private readonly store: GraphStore,
    private readonly searchEngine: SemanticSearchEngine,
  ) {
    this.analyzer = new QueryAnalyzer();
    this.planner = new DefaultRetrievalPlanner();
    this.expander = new GraphExpander(store);
    this.compressor = new ContextCompressor();
  }

  public async retrieve(query: RetrievalQuery): Promise<RetrievalBundle> {
    const startTime = Date.now();

    // Stage 1: Query Intent Analysis
    const intent = this.analyzer.analyze(query.text, query.categoryHint);

    // Stage 2: Retrieval Planning
    const plan = this.planner.createPlan(intent, query.maxTokens ?? 2000);

    // Stage 3: Vector Search
    const vecStart = Date.now();
    const vectorResults = await this.searchEngine.searchVector(query.text, plan.vectorK, {
      repositoryId: query.repositoryId,
    });
    const vectorLatencyMs = Date.now() - vecStart;

    // Fetch seed graph nodes
    const seedNodes = (
      await Promise.all(vectorResults.map((r) => this.store.getNode(r.id)))
    ).filter((n): n is NonNullable<typeof n> => n !== null);

    // Stage 4: Graph Expansion
    const graphStart = Date.now();
    const { expandedEntities, relationships } = await this.expander.expand(
      seedNodes,
      plan.expansionStrategies,
      plan.maxHops,
    );
    const graphLatencyMs = Date.now() - graphStart;

    // Stage 5: Context Compression
    const compStart = Date.now();
    const { compressedEntities, compressedRelationships, evidence } = this.compressor.compress(
      expandedEntities,
      relationships,
      plan.tokenBudget,
    );
    const compressionLatencyMs = Date.now() - compStart;

    const totalDurationMs = Date.now() - startTime;

    // Categorize Files & Symbols
    const files: string[] = [];
    const symbols: string[] = [];

    for (const ent of compressedEntities) {
      if (ent.kind === 'File') files.push(ent.label);
      if (ent.kind === 'Symbol') symbols.push(ent.label);
    }

    const statistics: RetrievalMetrics = {
      vectorLatencyMs,
      graphLatencyMs,
      rankingLatencyMs: 0,
      compressionLatencyMs,
      cacheHits: 0,
      entityCount: compressedEntities.length,
      relationshipCount: compressedRelationships.length,
      totalDurationMs,
    };

    const summary = `Retrieved ${compressedEntities.length} entities and ${compressedRelationships.length} relationships for '${intent.category}' query in ${totalDurationMs}ms.`;

    return {
      summary,
      intent,
      plan,
      entities: compressedEntities,
      files,
      symbols,
      relationships: compressedRelationships,
      evidence,
      metadata: {
        queryText: query.text,
        repositoryId: query.repositoryId,
      },
      statistics,
    };
  }
}
