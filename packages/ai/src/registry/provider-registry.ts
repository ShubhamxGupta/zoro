import type { AIProvider, ProviderHealthStatus } from '@repo-intel/shared';
import { MockAIProvider } from '../providers/mock-ai-provider.js';

export class ProviderRegistry {
  private readonly providers = new Map<string, AIProvider>();
  private activeProviderName = 'mock';

  constructor() {
    this.register('mock', new MockAIProvider());
  }

  public register(name: string, provider: AIProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

  public get(name: string): AIProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  public getActive(): AIProvider {
    const active = this.providers.get(this.activeProviderName.toLowerCase());
    return active ?? this.providers.get('mock') ?? new MockAIProvider();
  }

  public setActive(name: string): void {
    if (this.providers.has(name.toLowerCase())) {
      this.activeProviderName = name.toLowerCase();
    }
  }

  public async getHealthyProvider(
    preferredOrder = ['openai', 'ollama', 'mock'],
  ): Promise<AIProvider> {
    for (const name of preferredOrder) {
      const provider = this.providers.get(name.toLowerCase());
      if (provider) {
        const health = await provider.health();
        if (health.isAvailable) {
          return provider;
        }
      }
    }
    return this.getActive();
  }

  public async checkAllHealth(): Promise<ProviderHealthStatus[]> {
    const statuses: ProviderHealthStatus[] = [];
    for (const provider of this.providers.values()) {
      statuses.push(await provider.health());
    }
    return statuses;
  }
}
