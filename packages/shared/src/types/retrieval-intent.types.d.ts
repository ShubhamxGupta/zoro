/**
 * Query Intent Classification Model
 */
export type QueryIntentCategory = 'bug_investigation' | 'architecture' | 'dependency' | 'performance' | 'security' | 'documentation' | 'refactoring' | 'general_search';
export interface QueryIntent {
    category: QueryIntentCategory;
    confidence: number;
    keywords: string[];
    targetLanguages?: string[];
}
//# sourceMappingURL=retrieval-intent.types.d.ts.map