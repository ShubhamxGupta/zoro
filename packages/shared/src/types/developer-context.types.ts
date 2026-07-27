import type { StructuredDiff, StructuredDiffSymbolChange } from './git-provider.types.js';
import type { GraphNode } from './graph.types.js';
import type { RetrievalBundle } from './retrieval-bundle.types.js';

export interface DeveloperContext {
  diff: StructuredDiff;
  changedSymbols: StructuredDiffSymbolChange[];
  impactedSymbols: GraphNode[];
  dependencies: string[];
  affectedArchitecture: string[];
  historicalContext: string[];
  relatedDocumentation: string[];
  relatedTests: string[];
  retrievalBundle: RetrievalBundle;
  generatedAt: string;
}
