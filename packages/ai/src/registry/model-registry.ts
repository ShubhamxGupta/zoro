import type { ModelCapabilities } from '@repo-intel/shared';

export class ModelRegistry {
  private readonly models = new Map<string, ModelCapabilities>();

  constructor() {
    this.registerDefaults();
  }

  public register(model: ModelCapabilities): void {
    const key = `${model.provider.toLowerCase()}::${model.model.toLowerCase()}`;
    this.models.set(key, model);
  }

  public get(provider: string, model: string): ModelCapabilities | undefined {
    const key = `${provider.toLowerCase()}::${model.toLowerCase()}`;
    return this.models.get(key);
  }

  public listAll(): ModelCapabilities[] {
    return Array.from(this.models.values());
  }

  private registerDefaults(): void {
    this.register({
      provider: 'openai',
      model: 'gpt-4o',
      contextWindow: 128000,
      pricingPer1kInput: 0.0025,
      pricingPer1kOutput: 0.01,
      supportsReasoning: true,
      supportsTools: true,
      supportsStreaming: true,
      supportsVision: true,
    });

    this.register({
      provider: 'openai',
      model: 'gpt-4o-mini',
      contextWindow: 128000,
      pricingPer1kInput: 0.00015,
      pricingPer1kOutput: 0.0006,
      supportsReasoning: true,
      supportsTools: true,
      supportsStreaming: true,
      supportsVision: true,
    });

    this.register({
      provider: 'ollama',
      model: 'llama3',
      contextWindow: 8192,
      pricingPer1kInput: 0,
      pricingPer1kOutput: 0,
      supportsReasoning: false,
      supportsTools: false,
      supportsStreaming: true,
      supportsVision: false,
    });

    this.register({
      provider: 'mock',
      model: 'mock-gpt-4o',
      contextWindow: 128000,
      pricingPer1kInput: 0,
      pricingPer1kOutput: 0,
      supportsReasoning: true,
      supportsTools: true,
      supportsStreaming: true,
      supportsVision: false,
    });
  }
}
