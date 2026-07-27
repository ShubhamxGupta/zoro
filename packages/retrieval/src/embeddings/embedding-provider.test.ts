import { describe, it, expect } from 'vitest';
import { MockEmbeddingProvider } from './mock-embedding-provider.js';

describe('MockEmbeddingProvider', () => {
  it('generates deterministic embedding vectors of fixed dimensions', async () => {
    const provider = new MockEmbeddingProvider();

    expect(provider.dimensions()).toBe(128);
    expect(provider.model()).toBe('mock-embedding-v1');

    const v1 = await provider.embed('function calculateTotal(a: number)');
    const v2 = await provider.embed('function calculateTotal(a: number)');
    const v3 = await provider.embed('class UserService');

    expect(v1).toHaveLength(128);
    expect(v1).toEqual(v2);
    expect(v1).not.toEqual(v3);
  });
});
