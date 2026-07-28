import { describe, it, expect } from 'vitest';
import { VLLMProvider } from './vllm-provider.js';

describe('VLLMProvider Integration Suite', () => {
  it('instantiates cleanly with default base URL and metadata', () => {
    const provider = new VLLMProvider();
    const meta = provider.metadata();
    expect(meta.provider).toBe('vllm');
    expect(meta.model).toBe('meta-llama/Meta-Llama-3-8B-Instruct');
    expect(meta.contextWindow).toBe(32768);
    expect(meta.supportsStreaming).toBe(true);
  });

  it('handles offline fallback for chat gracefully when local runner is offline', async () => {
    const provider = new VLLMProvider('http://127.0.0.1:99999/v1');
    const response = await provider.chat('Review code vulnerability');
    expect(response.provider).toBe('vllm');
    expect(response.content).toContain('[vLLM Fallback Mock');
    expect(response.usage?.totalTokens).toBeGreaterThan(0);
  });

  it('streams fallback completion chunks when runner is offline', async () => {
    const provider = new VLLMProvider('http://127.0.0.1:99999/v1');
    const chunks = [];
    for await (const chunk of provider.stream('Explain architecture')) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]?.isComplete).toBe(true);
  });

  it('provides default embeddings on offline fallback', async () => {
    const provider = new VLLMProvider('http://127.0.0.1:99999/v1');
    const vec = await provider.embeddings(['function test() {}']);
    expect(vec).toHaveLength(1);
    expect(vec[0]).toHaveLength(4096);
  });

  it('reports health as unavailable when server is offline', async () => {
    const provider = new VLLMProvider('http://127.0.0.1:99999/v1');
    const health = await provider.health();
    expect(health.provider).toBe('vllm');
    expect(health.isAvailable).toBe(false);
  });
});
