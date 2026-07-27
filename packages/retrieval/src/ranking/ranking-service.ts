import type { SearchResult } from '@repo-intel/shared';

export interface RankingWeights {
  vectorWeight: number;
  graphWeight: number;
  lexicalWeight: number;
  importanceWeight: number;
}

export class RankingService {
  private readonly weights: RankingWeights;

  constructor(customWeights?: Partial<RankingWeights>) {
    this.weights = {
      vectorWeight: customWeights?.vectorWeight ?? 0.5,
      graphWeight: customWeights?.graphWeight ?? 0.25,
      lexicalWeight: customWeights?.lexicalWeight ?? 0.15,
      importanceWeight: customWeights?.importanceWeight ?? 0.1,
    };
  }

  public rerank(results: SearchResult[], queryText: string): SearchResult[] {
    const terms = queryText.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = results.map((res) => {
      const vectorScore = res.score;

      // Lexical relevance check
      const labelLower = res.record.metadata.label.toLowerCase();
      let matches = 0;
      for (const term of terms) {
        if (labelLower.includes(term)) matches++;
      }
      const lexicalScore = terms.length > 0 ? matches / terms.length : 0;

      // Graph & Importance score defaults
      const graphScore = (res.record.metadata.inboundEdgeCount as number | undefined) ?? 0.5;
      const importanceScore = res.record.metadata.entityKind === 'Symbol' ? 1.0 : 0.7;

      const finalScore =
        vectorScore * this.weights.vectorWeight +
        lexicalScore * this.weights.lexicalWeight +
        graphScore * this.weights.graphWeight +
        importanceScore * this.weights.importanceWeight;

      return {
        ...res,
        score: Number(finalScore.toFixed(4)),
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }
}
