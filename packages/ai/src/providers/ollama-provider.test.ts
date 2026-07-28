import { describe, it, expect } from 'vitest';
import { OllamaProvider } from './ollama-provider.js';

describe('OllamaProvider Integration Suite', () => {
  it('instantiates cleanly with default base URL', () => {
    const provider = new OllamaProvider();
    const meta = provider.metadata();
    expect(meta.provider).toBe('ollama');
    expect(meta.model).toBe('llama3');
    expect(meta.contextWindow).toBe(8192);
    expect(meta.supportsStreaming).toBe(true);
  });

  it('handles offline fallback for chat gracefully when local runner is offline', async () => {
    const provider = new OllamaProvider('http://127.0.0.1:99999');
    const response = await provider.chat('Review code vulnerability');
    expect(response.provider).toBe('ollama');
    expect(response.content).toContain('[Ollama Fallback Mock');
    expect(response.usage?.totalTokens).toBeGreaterThan(0);
  });

  it('streams fallback completion chunks when runner is offline', async () => {
    const provider = new OllamaProvider('http://127.0.0.1:99999');
    const chunks = [];
    for await (const chunk of provider.stream('Explain architecture')) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]?.isComplete).toBe(true);
  });

  it('provides default embeddings on offline fallback', async () => {
    const provider = new OllamaProvider('http://127.0.0.1:99999');
    const vec = await provider.embeddings(['function test() {}']);
    expect(vec).toHaveLength(1);
    expect(vec[0]).toHaveLength(768);
  });

  it('returns empty model list when server is offline', async () => {
    const provider = new OllamaProvider('http://127.0.0.1:99999');
    const models = await provider.listLocalModels();
    expect(models).toEqual([]);
  });

  it('reports health as unavailable when server is offline', async () => {
    const provider = new OllamaProvider('http://127.0.0.1:99999');
    const health = await provider.health();
    expect(health.provider).toBe('ollama');
    expect(health.isAvailable).toBe(false);
  });
});
