import fs from 'node:fs';
import path from 'node:path';
import type {
  AIProviderPlugin,
  AIProvider,
  ModelCapabilityMap,
  ProviderHealthMetrics,
  ProviderUsageMetrics,
  ProviderConfiguration,
} from '@repo-intel/shared';
import { OpenAIPlugin } from '../plugins/openai-plugin.js';
import { ClaudePlugin } from '../plugins/claude-plugin.js';
import { OllamaPlugin } from '../plugins/ollama-plugin.js';
import { VLLMPlugin } from '../plugins/vllm-plugin.js';
import { MockPlugin } from '../plugins/mock-plugin.js';

export class ProviderManager {
  private readonly plugins = new Map<string, AIProviderPlugin>();
  private readonly healthMap = new Map<string, ProviderHealthMetrics>();
  private readonly usageMap = new Map<string, ProviderUsageMetrics>();
  private readonly configs = new Map<string, ProviderConfiguration>();
  private activePluginName = 'mock';
  private activeModelName = 'mock-v1';
  private configFilePath: string;

  constructor(configFilePath?: string) {
    this.configFilePath = configFilePath ?? path.join(process.cwd(), '.repo-intel-providers.json');

    // Register built-in default plugins
    this.registerPlugin(new MockPlugin());
    this.registerPlugin(new OpenAIPlugin());
    this.registerPlugin(new ClaudePlugin());
    this.registerPlugin(new OllamaPlugin());
    this.registerPlugin(new VLLMPlugin());

    this.loadPersistedConfig();
  }

  public registerPlugin(plugin: AIProviderPlugin): void {
    const key = plugin.name.toLowerCase();
    this.plugins.set(key, plugin);

    this.healthMap.set(key, {
      provider: plugin.name,
      isAvailable: false,
      latencyMs: 0,
      successRate: 100,
      errorRate: 0,
      totalRequests: 0,
      activeModel: plugin.models[0] ?? 'default',
      lastCheck: new Date().toISOString(),
    });

    this.usageMap.set(key, {
      provider: plugin.name,
      requests: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      estimatedRamMb: key === 'ollama' || key === 'vllm' ? 4096 : 0,
      avgLatencyMs: 0,
    });
  }

  public async initializeAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.initialize();
      } catch {
        // Ignore initialization failure; health monitor will capture availability
      }
    }
    await this.checkAllHealth();
  }

  public getActivePlugin(): AIProviderPlugin {
    const plugin = this.plugins.get(this.activePluginName.toLowerCase());
    return plugin ?? this.plugins.get('mock')!;
  }

  public getActiveProvider(): AIProvider {
    return this.getActivePlugin().provider;
  }

  public getActiveModel(): string {
    return this.activeModelName;
  }

  public async switchProvider(providerName: string, modelName?: string): Promise<boolean> {
    const key = providerName.toLowerCase();
    const plugin = this.plugins.get(key);
    if (!plugin) return false;

    this.activePluginName = key;
    if (modelName) {
      this.activeModelName = modelName;
    } else if (plugin.models.length > 0 && plugin.models[0]) {
      this.activeModelName = plugin.models[0];
    }

    const health = this.healthMap.get(key);
    if (health) {
      health.activeModel = this.activeModelName;
    }

    this.persistConfig();
    return true;
  }

  public hasCapability(capability: keyof ModelCapabilityMap, providerName?: string): boolean {
    const key = (providerName ?? this.activePluginName).toLowerCase();
    const plugin = this.plugins.get(key);
    if (!plugin) return false;
    return Boolean(plugin.capabilities[capability]);
  }

  public recordUsage(
    providerName: string,
    promptTokens: number,
    completionTokens: number,
    durationMs: number,
    isError = false,
  ): void {
    const key = providerName.toLowerCase();
    const usage = this.usageMap.get(key);
    const health = this.healthMap.get(key);

    if (usage) {
      usage.requests += 1;
      usage.promptTokens += promptTokens;
      usage.completionTokens += completionTokens;
      usage.totalTokens += promptTokens + completionTokens;
      usage.avgLatencyMs = Math.round((usage.avgLatencyMs * (usage.requests - 1) + durationMs) / usage.requests);

      // Estimate costs
      if (key === 'openai') {
        usage.estimatedCostUsd += (promptTokens * 0.0025 + completionTokens * 0.01) / 1000;
      } else if (key === 'claude' || key === 'anthropic') {
        usage.estimatedCostUsd += (promptTokens * 0.003 + completionTokens * 0.015) / 1000;
      }
    }

    if (health) {
      health.totalRequests += 1;
      if (isError) {
        const errorCount = Math.round((health.errorRate / 100) * (health.totalRequests - 1)) + 1;
        health.errorRate = Math.round((errorCount / health.totalRequests) * 100);
        health.successRate = 100 - health.errorRate;
      } else {
        const successCount = Math.round((health.successRate / 100) * (health.totalRequests - 1)) + 1;
        health.successRate = Math.round((successCount / health.totalRequests) * 100);
        health.errorRate = 100 - health.successRate;
      }
    }
  }

  public async checkAllHealth(): Promise<ProviderHealthMetrics[]> {
    const metrics: ProviderHealthMetrics[] = [];
    for (const [key, plugin] of this.plugins.entries()) {
      const start = Date.now();
      try {
        const status = await plugin.provider.health();
        const existing = this.healthMap.get(key)!;
        existing.isAvailable = status.isAvailable;
        existing.latencyMs = status.latencyMs || Date.now() - start;
        existing.lastCheck = new Date().toISOString();
        metrics.push({ ...existing });
      } catch (err: any) {
        const existing = this.healthMap.get(key)!;
        existing.isAvailable = false;
        existing.latencyMs = 0;
        existing.lastCheck = new Date().toISOString();
        metrics.push({ ...existing });
      }
    }
    return metrics;
  }

  public getAllCapabilities(): Array<{ provider: string; capabilities: ModelCapabilityMap }> {
    return Array.from(this.plugins.values()).map((p) => ({
      provider: p.name,
      capabilities: p.capabilities,
    }));
  }

  public getAllModels(): Array<{ provider: string; models: string[] }> {
    return Array.from(this.plugins.values()).map((p) => ({
      provider: p.name,
      models: p.models,
    }));
  }

  public getAllUsage(): ProviderUsageMetrics[] {
    return Array.from(this.usageMap.values());
  }

  public getAllHealth(): ProviderHealthMetrics[] {
    return Array.from(this.healthMap.values());
  }

  public setConfiguration(config: ProviderConfiguration): void {
    const key = config.provider.toLowerCase();
    this.configs.set(key, config);
    this.persistConfig();
  }

  public getConfiguration(providerName: string): ProviderConfiguration | undefined {
    return this.configs.get(providerName.toLowerCase());
  }

  private persistConfig(): void {
    try {
      const data = {
        activeProvider: this.activePluginName,
        activeModel: this.activeModelName,
        configs: Object.fromEntries(this.configs.entries()),
      };
      fs.writeFileSync(this.configFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Ignore write errors in sandbox / test environments
    }
  }

  private loadPersistedConfig(): void {
    try {
      if (fs.existsSync(this.configFilePath)) {
        const content = fs.readFileSync(this.configFilePath, 'utf-8');
        const data = JSON.parse(content) as {
          activeProvider?: string;
          activeModel?: string;
          configs?: Record<string, ProviderConfiguration>;
        };

        if (data.activeProvider) this.activePluginName = data.activeProvider;
        if (data.activeModel) this.activeModelName = data.activeModel;
        if (data.configs) {
          for (const [k, v] of Object.entries(data.configs)) {
            this.configs.set(k, v);
          }
        }
      }
    } catch {
      // Fallback on defaults
    }
  }

  public async disposeAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      await plugin.dispose();
    }
  }
}
