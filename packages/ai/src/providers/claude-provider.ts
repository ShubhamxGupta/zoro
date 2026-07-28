import type {
  AIProvider,
  AIChatOptions,
  AIChatResponse,
  AIStreamChunk,
  ProviderHealthStatus,
  ModelCapabilities,
} from '@repo-intel/shared';

export class ClaudeProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(apiKey?: string, defaultModel = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey ?? process.env['ANTHROPIC_API_KEY'] ?? 'mock-key';
    this.defaultModel = defaultModel;
  }

  public async chat(prompt: string, options?: AIChatOptions): Promise<AIChatResponse> {
    const start = Date.now();
    const model = options?.model ?? this.defaultModel;

    if (this.apiKey === 'mock-key' || !this.apiKey) {
      return {
        content: `[Claude Fallback Mock] Processed prompt for model ${model}`,
        provider: 'anthropic',
        model,
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        durationMs: Date.now() - start,
      };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens ?? 4096,
          temperature: options?.temperature ?? 0.2,
          system: options?.systemPrompt ?? 'You are an expert AI code review assistant.',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API Error (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
        model: string;
        usage?: { input_tokens: number; output_tokens: number };
      };

      const text = data.content?.[0]?.text ?? '';
      const inputTokens = data.usage?.input_tokens ?? 0;
      const outputTokens = data.usage?.output_tokens ?? 0;

      return {
        content: text,
        provider: 'anthropic',
        model: data.model || model,
        usage: {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        content: `[Claude Fallback Error] ${(error as Error).message}`,
        provider: 'anthropic',
        model,
        durationMs: Date.now() - start,
      };
    }
  }

  public async *stream(prompt: string, options?: AIChatOptions): AsyncIterable<AIStreamChunk> {
    const model = options?.model ?? this.defaultModel;

    if (this.apiKey === 'mock-key' || !this.apiKey) {
      yield { delta: `[Claude Fallback Mock Stream] ${prompt.substring(0, 30)}`, isComplete: true };
      return;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens ?? 4096,
          temperature: options?.temperature ?? 0.2,
          system: options?.systemPrompt ?? 'You are an expert AI code review assistant.',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const res = await this.chat(prompt, options);
        yield { delta: res.content, isComplete: true };
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const event = JSON.parse(jsonStr) as {
                type: string;
                delta?: { text?: string };
              };
              if (event.type === 'content_block_delta' && event.delta?.text) {
                yield { delta: event.delta.text, isComplete: false };
              }
            } catch {
              // Ignore non-JSON lines
            }
          }
        }
      }

      yield { delta: '', isComplete: true };
    } catch {
      const fallback = await this.chat(prompt, options);
      yield { delta: fallback.content, isComplete: true };
    }
  }

  public async embeddings(texts: string[]): Promise<number[][]> {
    // Anthropic Messages API does not provide a native embeddings endpoint.
    // Return standard fallback embedding vectors.
    return texts.map(() => new Array<number>(1536).fill(0.05));
  }

  public async health(): Promise<ProviderHealthStatus> {
    const isConfigured = this.apiKey !== 'mock-key' && Boolean(this.apiKey);
    return {
      provider: 'anthropic',
      isAvailable: isConfigured,
      latencyMs: isConfigured ? 150 : 0,
    };
  }

  public metadata(): ModelCapabilities {
    return {
      provider: 'anthropic',
      model: this.defaultModel,
      contextWindow: 200000,
      pricingPer1kInput: 0.003,
      pricingPer1kOutput: 0.015,
      supportsReasoning: true,
      supportsTools: true,
      supportsStreaming: true,
      supportsVision: true,
    };
  }
}
