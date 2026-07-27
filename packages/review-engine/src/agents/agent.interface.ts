import type { AIProvider, ExplainableFinding, RetrievalBundle } from '@repo-intel/shared';
import type { PromptCategory } from '@repo-intel/ai';

export interface ReviewAgent {
  readonly name: string;
  readonly category: PromptCategory;
  analyze(bundle: RetrievalBundle, provider: AIProvider): Promise<ExplainableFinding[]>;
}
