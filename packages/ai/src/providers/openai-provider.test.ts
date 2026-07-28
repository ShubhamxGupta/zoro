import { describe, it, expect } from 'vitest';
import { OpenAIProvider } from './openai-provider.js';

describe('OpenAIProvider Integration Suite', () => {
  it('instantiates cleanly with mock fallback when API key is unconfigured', async () => {
    const provider = new OpenAIProvider('mock-key');
    const health = await provider.health();
    expect(health.provider).toBe('openai');
    expect(health.isAvailable).toBe(false);
  });

  it('returns valid metadata capabilities', () => {
    const provider = new OpenAIProvider();
    const meta = provider.metadata();
    expect(meta.provider).toBe('openai');
    expect(meta.model).toBe('gpt-4o');
    expect(meta.contextWindow).toBe(128000);
    expect(meta.supportsStreaming).toBe(true);
  });

  it('processes chat fallback completion seamlessly', async () => {
    const provider = new OpenAIProvider('mock-key');
    const response = await provider.chat('Review this security function');
    expect(response.provider).toBe('openai');
    expect(response.content).toContain('[OpenAI Fallback Mock]');
    expect(response.usage?.totalTokens).toBeGreaterThan(0);
  });

  it('streams fallback completion chunks', async () => {
    const provider = new OpenAIProvider('mock-key');
    const chunks = [];
    for await (const chunk of provider.stream('Explain architecture')) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]?.isComplete).toBe(true);
  });

  it('provides default fallback embeddings', async () => {
    const provider = new OpenAIProvider('mock-key');
    const vec = await provider.embeddings(['function test() {}']);
    expect(vec).toHaveLength(1);
    expect(vec[0]).toHaveLength(1536);
  });
});
