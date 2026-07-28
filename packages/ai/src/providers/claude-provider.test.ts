import { describe, it, expect } from 'vitest';
import { ClaudeProvider } from './claude-provider.js';

describe('ClaudeProvider Integration Suite', () => {
  it('instantiates cleanly with mock fallback when API key is unconfigured', async () => {
    const provider = new ClaudeProvider('mock-key');
    const health = await provider.health();
    expect(health.provider).toBe('anthropic');
    expect(health.isAvailable).toBe(false);
  });

  it('returns valid metadata capabilities', () => {
    const provider = new ClaudeProvider();
    const meta = provider.metadata();
    expect(meta.provider).toBe('anthropic');
    expect(meta.model).toBe('claude-3-5-sonnet-20241022');
    expect(meta.contextWindow).toBe(200000);
    expect(meta.supportsStreaming).toBe(true);
  });

  it('processes chat fallback completion seamlessly', async () => {
    const provider = new ClaudeProvider('mock-key');
    const response = await provider.chat('Review this security function');
    expect(response.provider).toBe('anthropic');
    expect(response.content).toContain('[Claude Fallback Mock]');
    expect(response.usage?.totalTokens).toBeGreaterThan(0);
  });

  it('streams fallback completion chunks', async () => {
    const provider = new ClaudeProvider('mock-key');
    const chunks = [];
    for await (const chunk of provider.stream('Explain architecture')) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]?.isComplete).toBe(true);
  });

  it('provides default fallback embeddings', async () => {
    const provider = new ClaudeProvider();
    const vec = await provider.embeddings(['function test() {}']);
    expect(vec).toHaveLength(1);
    expect(vec[0]).toHaveLength(1536);
  });
});
