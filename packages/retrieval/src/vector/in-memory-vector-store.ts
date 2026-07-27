import type { SearchQuery, SearchResult, VectorRecord, VectorStore } from '@repo-intel/shared';

export class InMemoryVectorStore implements VectorStore {
  private readonly records = new Map<string, VectorRecord>();

  public async upsert(record: VectorRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  public async upsertBatch(records: VectorRecord[]): Promise<void> {
    for (const rec of records) {
      this.records.set(rec.id, rec);
    }
  }

  public async search(query: SearchQuery): Promise<SearchResult[]> {
    if (!query.vector) return [];

    const queryVec = query.vector;
    const filter = query.filter;
    const results: SearchResult[] = [];

    for (const record of this.records.values()) {
      // Filter check
      if (filter) {
        if (filter.language && record.metadata.language !== filter.language) continue;
        if (filter.repositoryId && record.metadata.repositoryId !== filter.repositoryId) continue;
        if (filter.kind && record.metadata.kind !== filter.kind) continue;
        if (filter.entityKind && record.metadata.entityKind !== filter.entityKind) continue;
      }

      const score = this.cosineSimilarity(queryVec, record.vector);
      results.push({
        id: record.id,
        score,
        record,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.k);
  }

  public async delete(id: string): Promise<void> {
    this.records.delete(id);
  }

  public async get(id: string): Promise<VectorRecord | undefined> {
    return this.records.get(id);
  }

  public async clear(): Promise<void> {
    this.records.clear();
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const valA = a[i]!;
      const valB = b[i]!;
      dot += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }

    const norm = Math.sqrt(normA) * Math.sqrt(normB);
    return norm > 0 ? dot / norm : 0;
  }
}
