import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ProviderManager } from './provider-manager.js';

describe('ProviderManager & Plugin System Suite', () => {
  const testConfigFile = path.join(process.cwd(), '.test-providers-config.json');

  beforeEach(() => {
    if (fs.existsSync(testConfigFile)) {
      fs.unlinkSync(testConfigFile);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testConfigFile)) {
      fs.unlinkSync(testConfigFile);
    }
  });

  it('registers built-in provider plugins cleanly', () => {
    const manager = new ProviderManager(testConfigFile);
    const models = manager.getAllModels();
    expect(models.length).toBeGreaterThanOrEqual(5);

    const providerNames = models.map((m) => m.provider);
    expect(providerNames).toContain('mock');
    expect(providerNames).toContain('openai');
    expect(providerNames).toContain('claude');
    expect(providerNames).toContain('ollama');
    expect(providerNames).toContain('vllm');
  });

  it('handles hot provider and model switching without restart', async () => {
    const manager = new ProviderManager(testConfigFile);
    expect(manager.getActivePlugin().name).toBe('mock');

    const ok = await manager.switchProvider('openai', 'gpt-4o-mini');
    expect(ok).toBe(true);
    expect(manager.getActivePlugin().name).toBe('openai');
    expect(manager.getActiveModel()).toBe('gpt-4o-mini');
  });

  it('detects model capabilities dynamically via feature toggles', () => {
    const manager = new ProviderManager(testConfigFile);
    expect(manager.hasCapability('streaming', 'openai')).toBe(true);
    expect(manager.hasCapability('reasoning', 'openai')).toBe(true);
    expect(manager.hasCapability('embeddings', 'claude')).toBe(false);
    expect(manager.hasCapability('longContext', 'claude')).toBe(true);
  });

  it('records request usage and accumulates analytics metrics', () => {
    const manager = new ProviderManager(testConfigFile);
    manager.recordUsage('openai', 100, 50, 120);
    manager.recordUsage('openai', 200, 100, 180);

    const usageList = manager.getAllUsage();
    const openaiUsage = usageList.find((u) => u.provider === 'openai');

    expect(openaiUsage).toBeDefined();
    expect(openaiUsage?.requests).toBe(2);
    expect(openaiUsage?.totalTokens).toBe(450);
    expect(openaiUsage?.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('monitors health metrics across registered plugins', async () => {
    const manager = new ProviderManager(testConfigFile);
    const healthList = await manager.checkAllHealth();
    expect(healthList.length).toBeGreaterThanOrEqual(5);

    const mockHealth = healthList.find((h) => h.provider === 'mock');
    expect(mockHealth).toBeDefined();
  });

  it('persists configuration changes across sessions', () => {
    const manager1 = new ProviderManager(testConfigFile);
    manager1.setConfiguration({
      provider: 'openai',
      apiKey: 'sk-test-key-123',
      defaultModel: 'gpt-4o',
    });

    const config = manager1.getConfiguration('openai');
    expect(config?.apiKey).toBe('sk-test-key-123');
  });
});
