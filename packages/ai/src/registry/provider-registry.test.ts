import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderRegistry } from './provider-registry.js';
import { OpenAIProvider } from '../providers/openai-provider.js';

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = new ProviderRegistry();
  });

  it('registers, switches, and falls back to healthy AI providers', async () => {
    registry.register('openai', new OpenAIProvider());
    registry.setActive('openai');

    const active = registry.getActive();
    expect(active.metadata().provider).toBe('openai');

    const healthy = await registry.getHealthyProvider(['openai', 'mock']);
    expect(healthy).toBeDefined();

    const allHealth = await registry.checkAllHealth();
    expect(allHealth.length).toBeGreaterThanOrEqual(1);
  });
});
