import type { SearchResult } from './vector-store.types.js';

export interface VectorSearch {
  searchVector(
    queryText: string,
    k: number,
    filter?: Record<string, unknown>,
  ): Promise<SearchResult[]>;
}

export interface GraphSearch {
  searchGraph(entityId: string, depth: number): Promise<unknown>;
}

export interface KeywordSearch {
  searchKeyword(term: string, k: number): Promise<SearchResult[]>;
}
