import { TokenCounter } from './token-counter.js';

export interface PromptContextPayload {
  systemPrompt: string;
  changedCode: string;
  diffContent: string;
  graphContext?: string;
  historicalContext?: string;
}

export class TokenPruner {
  public static prunePayload(
    payload: PromptContextPayload,
    maxBudgetTokens: number,
    modelName = 'default',
  ): PromptContextPayload {
    const sysTokens = TokenCounter.countTokens(payload.systemPrompt, modelName);
    const codeTokens = TokenCounter.countTokens(payload.changedCode, modelName);
    const diffTokens = TokenCounter.countTokens(payload.diffContent, modelName);

    let remainingBudget = maxBudgetTokens - (sysTokens + codeTokens + diffTokens);

    let prunedGraph = payload.graphContext || '';
    let prunedHistory = payload.historicalContext || '';

    // Step 1: Prune historical context first
    if (prunedHistory && remainingBudget < TokenCounter.countTokens(prunedHistory, modelName)) {
      const allowedChars = Math.max(0, remainingBudget * 3.5);
      prunedHistory = prunedHistory.substring(0, allowedChars) + '\n[Truncated Historical Context...]';
      remainingBudget -= TokenCounter.countTokens(prunedHistory, modelName);
    }

    // Step 2: Prune 2-hop graph context if budget still tight
    if (prunedGraph && remainingBudget < TokenCounter.countTokens(prunedGraph, modelName)) {
      const allowedChars = Math.max(0, remainingBudget * 3.5);
      prunedGraph = prunedGraph.substring(0, allowedChars) + '\n[Truncated Graph Context...]';
    }

    return {
      systemPrompt: payload.systemPrompt,
      changedCode: payload.changedCode,
      diffContent: payload.diffContent,
      graphContext: prunedGraph,
      historicalContext: prunedHistory,
    };
  }
}
