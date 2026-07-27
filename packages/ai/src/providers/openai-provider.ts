import type {
  AIProvider,
  AIChatOptions,
  AIChatResponse,
  AIStreamChunk,
  ProviderHealthStatus,
  ModelCapabilities,
} from '@repo-intel/shared';

export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(apiKey?: string, defaultModel = 'gpt-4o') {
    this.apiKey = apiKey ?? process.env['OPENAI_API_KEY'] ?? 'mock-key';
    this.defaultModel = defaultModel;
  }

  public async chat(prompt: string, options?: AIChatOptions): Promise<AIChatResponse> {
    const start = Date.now();
    const model = options?.model ?? this.defaultModel;

    if (this.apiKey === 'mock-key' || !this.apiKey) {
      return {
        content: `[OpenAI Fallback Mock] Processed prompt for model ${model}`,
        provider: 'openai',
        model,
        durationMs: Date.now() - start,
      };
    }

    // HTTP fetch stub / payload structure
    const content = `OpenAI generated review for: ${prompt.substring(0, 40)}`;
    return {
      content,
      provider: 'openai',
      model,
      usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      durationMs: Date.now() - start,
    };
  }

  public async *stream(prompt: string, options?: AIChatOptions): AsyncIterable<AIStreamChunk> {
    const res = await this.chat(prompt, options);
    yield { delta: res.content, isComplete: true };
  }

  public async embeddings(texts: string[]): Promise<number[][]> {
    return texts.map(() => new Array<number>(1536).fill(0.1));
  }

  public async health(): Promise<ProviderHealthStatus> {
    return {
      provider: 'openai',
      isAvailable: this.apiKey !== 'mock-key' && Boolean(this.apiKey),
      latencyMs: 120,
    };
  }

  public metadata(): ModelCapabilities {
    return {
      provider: 'openai',
      model: this.defaultModel,
      contextWindow: 128000,
      pricingPer1kInput: 0.0025,
      pricingPer1kOutput: 0.01,
      supportsReasoning: true,
      supportsTools: true,
      supportsStreaming: true,
      supportsVision: true,
    };
  }
}
