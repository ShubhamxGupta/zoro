import type { EmbeddingProvider, SearchQueryFilter, SearchResult, VectorStore, VectorSearch } from '@repo-intel/shared';
import { RankingService } from '../ranking/ranking-service.js';

export class SemanticSearchEngine implements VectorSearch {
  private readonly rankingService: RankingService;

  constructor(
    private readonly provider: EmbeddingProvider,
    private readonly vectorStore: VectorStore,
    rankingService?: RankingService
  ) {
    this.rankingService = rankingService ?? new RankingService();
  }

  public async searchVector(queryText: string, k = 10, filter?: SearchQueryFilter): Promise<SearchResult[]> {
    const vector = await this.provider.embed(queryText);
    const rawResults = await this.vectorStore.search({
      vector,
      text: queryText,
      k: k * 2, // Over-fetch for reranking
      filter,
    });

    const ranked = this.rankingService.rerank(rawResults, queryText);
    return ranked.slice(0, k);
  }
}
