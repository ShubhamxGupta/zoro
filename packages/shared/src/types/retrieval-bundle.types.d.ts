import type { QueryIntent } from './retrieval-intent.types.js';
import type { RetrievalPlan } from './retrieval-planner.types.js';
import type { EntityRetrievalProvenance } from './retrieval-provenance.types.js';
import type { GraphNode, GraphEdge } from './graph.types.js';
export interface RetrievalMetrics {
    vectorLatencyMs: number;
    graphLatencyMs: number;
    rankingLatencyMs: number;
    compressionLatencyMs: number;
    cacheHits: number;
    entityCount: number;
    relationshipCount: number;
    totalDurationMs: number;
}
export interface RetrievalBundleEntity extends GraphNode {
    retrievalProvenance?: EntityRetrievalProvenance;
}
export interface RetrievalBundle {
    summary: string;
    intent: QueryIntent;
    plan: RetrievalPlan;
    entities: RetrievalBundleEntity[];
    files: string[];
    symbols: string[];
    relationships: GraphEdge[];
    evidence: string[];
    metadata: Record<string, unknown>;
    statistics: RetrievalMetrics;
}
//# sourceMappingURL=retrieval-bundle.types.d.ts.map