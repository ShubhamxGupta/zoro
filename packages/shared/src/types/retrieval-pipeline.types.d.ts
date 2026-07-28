import type { QueryIntentCategory } from './retrieval-intent.types.js';
import type { RetrievalBundle } from './retrieval-bundle.types.js';
export interface RetrievalQuery {
    text: string;
    repositoryId?: string;
    maxTokens?: number;
    categoryHint?: QueryIntentCategory;
}
export interface RetrievalPipeline {
    retrieve(query: RetrievalQuery): Promise<RetrievalBundle>;
}
//# sourceMappingURL=retrieval-pipeline.types.d.ts.map