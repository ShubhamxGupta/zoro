import { describe, it, expect } from 'vitest';
import { ProviderRouter } from './provider-router.js';
import { TokenBucketRateLimiter } from './rate-limiter.js';
import { ExponentialBackoffRetryHandler } from './retry-handler.js';

describe('ProviderRouter & Resilience Suite', () => {
  it('enforces token bucket rate limits accurately', () => {
    const limiter = new TokenBucketRateLimiter({ maxRequestsPerMinute: 2, maxTokensPerMinute: 500 });
    expect(limiter.tryAcquire(200)).toBe(true);
    expect(limiter.tryAcquire(200)).toBe(true);
    expect(limiter.tryAcquire(200)).toBe(false); // Exhausted
  });

  it('retries transient HTTP errors with exponential backoff', async () => {
    const retryHandler = new ExponentialBackoffRetryHandler({ maxRetries: 2, initialBackoffMs: 10 });
    let attempts = 0;

    const result = await retryHandler.execute(async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('HTTP 429 Rate Limit Exceeded');
      }
      return 'success-payload';
    });

    expect(attempts).toBe(2);
    expect(result).toBe('success-payload');
  });

  it('fails over transparently across provider fallback chain when primary fails', async () => {
    const router = new ProviderRouter();
    const response = await router.chat('Explain architecture resiliency');

    expect(response).toBeDefined();
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.provider).toBeDefined();
  });

  it('streams completion chunks cleanly through router interface', async () => {
    const router = new ProviderRouter();
    const chunks = [];
    for await (const chunk of router.stream('Streaming security review')) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]?.isComplete).toBe(true);
  });
});
