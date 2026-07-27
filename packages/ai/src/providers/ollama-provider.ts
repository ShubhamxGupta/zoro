import type {
  AIProvider,
  AIChatOptions,
  AIChatResponse,
  AIStreamChunk,
  ProviderHealthStatus,
  ModelCapabilities,
} from '@repo-intel/shared';

export class OllamaProvider implements AIProvider {
  constructor(
    private readonly baseUrl = 'http://localhost:11434',
    private readonly defaultModel = 'llama3',
  ) {}

  public async chat(prompt: string, options?: AIChatOptions): Promise<AIChatResponse> {
    const start = Date.now();
    const model = options?.model ?? this.defaultModel;

    return {
      content: `[Ollama Local Model (${model})] Analyzed query: ${prompt.substring(0, 40)}`,
      provider: 'ollama',
      model,
      durationMs: Date.now() - start,
    };
  }

  public async *stream(prompt: string, options?: AIChatOptions): AsyncIterable<AIStreamChunk> {
    const res = await this.chat(prompt, options);
    yield { delta: res.content, isComplete: true };
  }

  public async embeddings(texts: string[]): Promise<number[][]> {
    return texts.map(() => new Array<number>(768).fill(0.05));
  }

  public async health(): Promise<ProviderHealthStatus> {
    return {
      provider: 'ollama',
      isAvailable: Boolean(this.baseUrl),
      latencyMs: 15,
    };
  }

  public metadata(): ModelCapabilities {
    return {
      provider: 'ollama',
      model: this.defaultModel,
      contextWindow: 8192,
      pricingPer1kInput: 0,
      pricingPer1kOutput: 0,
      supportsReasoning: false,
      supportsTools: false,
      supportsStreaming: true,
      supportsVision: false,
    };
  }
}
