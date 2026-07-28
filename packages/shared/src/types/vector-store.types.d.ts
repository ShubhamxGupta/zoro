import type { EmbeddingMetadata } from './embedding-metadata.types.js';
export interface VectorRecord {
    id: string;
    vector: number[];
    metadata: EmbeddingMetadata & Record<string, unknown>;
}
export interface SearchQueryFilter {
    language?: string;
    repositoryId?: string;
    kind?: string;
    entityKind?: string;
}
export interface SearchQuery {
    vector?: number[];
    text?: string;
    k: number;
    filter?: SearchQueryFilter;
}
export interface SearchResult {
    id: string;
    score: number;
    record: VectorRecord;
}
export interface VectorStore {
    upsert(record: VectorRecord): Promise<void>;
    upsertBatch(records: VectorRecord[]): Promise<void>;
    search(query: SearchQuery): Promise<SearchResult[]>;
    delete(id: string): Promise<void>;
    get(id: string): Promise<VectorRecord | undefined>;
    clear(): Promise<void>;
}
//# sourceMappingURL=vector-store.types.d.ts.map