import type {
  AIProvider,
  AIChatOptions,
  AIChatResponse,
  AIStreamChunk,
  ProviderHealthStatus,
  ModelCapabilities,
} from '@repo-intel/shared';
import { ProviderManager } from '../manager/provider-manager.js';
import { TokenBucketRateLimiter } from './rate-limiter.js';
import { ExponentialBackoffRetryHandler } from './retry-handler.js';

export interface RouterOptions {
  fallbackOrder?: string[];
  maxRetries?: number;
}

export class ProviderRouter implements AIProvider {
  private readonly manager: ProviderManager;
  private readonly fallbackOrder: string[];
  private readonly retryHandler: ExponentialBackoffRetryHandler;
  private readonly rateLimiters = new Map<string, TokenBucketRateLimiter>();

  constructor(manager?: ProviderManager, options?: RouterOptions) {
    this.manager = manager ?? new ProviderManager();
    this.fallbackOrder = options?.fallbackOrder ?? ['ollama', 'claude', 'openai', 'vllm', 'mock'];
    this.retryHandler = new ExponentialBackoffRetryHandler({ maxRetries: options?.maxRetries ?? 3 });

    for (const name of this.fallbackOrder) {
      this.rateLimiters.set(name.toLowerCase(), new TokenBucketRateLimiter());
    }
  }

  public async chat(prompt: string, options?: AIChatOptions): Promise<AIChatResponse> {
    const activePlugin = this.manager.getActivePlugin();
    const primaryOrder = [activePlugin.name, ...this.fallbackOrder.filter((n) => n.toLowerCase() !== activePlugin.name.toLowerCase())];

    let lastError: Error | null = null;

    for (const providerName of primaryOrder) {
      const key = providerName.toLowerCase();
      const limiter = this.rateLimiters.get(key) ?? new TokenBucketRateLimiter();

      if (!limiter.tryAcquire(100)) {
        continue; // Skip provider if rate limited
      }

      try {
        const start = Date.now();
        const res = await this.retryHandler.execute(async () => {
          const plugin = this.manager.getActivePlugin();
          const targetProvider = key === activePlugin.name.toLowerCase() ? plugin.provider : this.manager.getActivePlugin().provider;
          return await targetProvider.chat(prompt, options);
        });

        const duration = Date.now() - start;
        this.manager.recordUsage(
          providerName,
          res.usage?.promptTokens ?? 50,
          res.usage?.completionTokens ?? 50,
          duration,
          false,
        );

        return res;
      } catch (err: any) {
        lastError = err as Error;
        this.manager.recordUsage(providerName, 0, 0, 100, true);
        // Continue to fallback provider in chain
      }
    }

    // Ultimate fallback if all providers fail
    return {
      content: `[ProviderRouter Ultimate Fallback] Failure across fallback chain: ${lastError?.message}`,
      provider: 'mock',
      model: 'fallback-v1',
      durationMs: 0,
    };
  }

  public async *stream(prompt: string, options?: AIChatOptions): AsyncIterable<AIStreamChunk> {
    const res = await this.chat(prompt, options);
    yield { delta: res.content, isComplete: true };
  }

  public async embeddings(texts: string[]): Promise<number[][]> {
    return this.manager.getActiveProvider().embeddings(texts);
  }

  public async health(): Promise<ProviderHealthStatus> {
    return this.manager.getActiveProvider().health();
  }

  public metadata(): ModelCapabilities {
    return this.manager.getActivePlugin().metadata;
  }
}
