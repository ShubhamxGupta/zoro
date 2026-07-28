import { TokenCounter } from './token-counter.js';
import { TokenPruner, type PromptContextPayload } from './token-pruner.js';

export class PromptPipeline {
  public assemblePrompt(payload: PromptContextPayload, modelName = 'default'): string {
    const maxBudget = TokenCounter.getContextWindowLimit(modelName) - 1000; // Leave 1000 tokens for output
    const pruned = TokenPruner.prunePayload(payload, maxBudget, modelName);

    const sections: string[] = [];
    sections.push(`SYSTEM INSTRUCTIONS:\n${pruned.systemPrompt}`);
    sections.push(`\nTARGET CODE:\n${pruned.changedCode}`);
    sections.push(`\nGIT DIFF:\n${pruned.diffContent}`);

    if (pruned.graphContext) {
      sections.push(`\nKNOWLEDGE GRAPH CONTEXT:\n${pruned.graphContext}`);
    }
    if (pruned.historicalContext) {
      sections.push(`\nHISTORICAL REVIEW CONTEXT:\n${pruned.historicalContext}`);
    }

    return sections.join('\n\n');
  }
}
