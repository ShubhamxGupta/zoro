import type { QueryIntent } from './retrieval-intent.types.js';

export type ExpansionStrategy =
  'neighbours' | 'call_graph' | 'inheritance' | 'imports' | 'dependencies';

export interface RetrievalPlan {
  vectorK: number;
  maxHops: number;
  expansionStrategies: ExpansionStrategy[];
  tokenBudget: number;
  rankingPolicy: string;
}

export interface RetrievalPlanner {
  createPlan(intent: QueryIntent, maxTokensHint?: number): RetrievalPlan;
}
