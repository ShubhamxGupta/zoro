import { describe, it, expect } from 'vitest';
import { TokenCounter } from './token-counter.js';
import { TokenPruner } from './token-pruner.js';
import { PromptPipeline } from './prompt-pipeline.js';

describe('Prompt Pipeline & Token Pruner Suite', () => {
  it('counts tokens accurately based on model character ratios', () => {
    const text = 'function calculateSum(a: number, b: number): number { return a + b; }';
    const countGpt = TokenCounter.countTokens(text, 'gpt-4o');
    const countOllama = TokenCounter.countTokens(text, 'ollama');

    expect(countGpt).toBeGreaterThan(0);
    expect(countOllama).toBeGreaterThan(0);
  });

  it('prunes low priority historical context when budget is tight', () => {
    const payload = {
      systemPrompt: 'You are an AI code reviewer.',
      changedCode: 'function auth() { return true; }',
      diffContent: '+ function auth() { return true; }',
      graphContext: 'Graph Node A -> Graph Node B',
      historicalContext: 'A'.repeat(5000), // Oversized history
    };

    const pruned = TokenPruner.prunePayload(payload, 500, 'ollama');
    expect(pruned.historicalContext).toContain('[Truncated Historical Context...]');
    expect(pruned.systemPrompt).toBe(payload.systemPrompt);
  });

  it('assembles formatted prompt payload cleanly via PromptPipeline', () => {
    const pipeline = new PromptPipeline();
    const prompt = pipeline.assemblePrompt(
      {
        systemPrompt: 'You are a security auditor.',
        changedCode: 'const token = "secret";',
        diffContent: '+ const token = "secret";',
      },
      'gpt-4o',
    );

    expect(prompt).toContain('SYSTEM INSTRUCTIONS:');
    expect(prompt).toContain('TARGET CODE:');
    expect(prompt).toContain('GIT DIFF:');
  });
});
