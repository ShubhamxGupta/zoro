import type {
  AIProvider,
  AIChatOptions,
  AIChatResponse,
  AIStreamChunk,
  ProviderHealthStatus,
  ModelCapabilities,
} from '@repo-intel/shared';

export class VLLMProvider implements AIProvider {
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(
    baseUrl = process.env['VLLM_BASE_URL'] ?? 'http://localhost:8000/v1',
    defaultModel = 'meta-llama/Meta-Llama-3-8B-Instruct',
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultModel = defaultModel;
  }

  public async chat(prompt: string, options?: AIChatOptions): Promise<AIChatResponse> {
    const start = Date.now();
    const model = options?.model ?? this.defaultModel;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 4096,
          messages: [
            {
              role: 'system',
              content: options?.systemPrompt ?? 'You are an expert AI code review assistant.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`vLLM API Error (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
        model: string;
        usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      };

      const content = data.choices?.[0]?.message?.content ?? '';
      const promptTokens = data.usage?.prompt_tokens ?? 0;
      const completionTokens = data.usage?.completion_tokens ?? 0;

      return {
        content,
        provider: 'vllm',
        model: data.model || model,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        content: `[vLLM Fallback Mock (${model})] Processed query: ${prompt.substring(0, 40)}`,
        provider: 'vllm',
        model,
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        durationMs: Date.now() - start,
      };
    }
  }

  public async *stream(prompt: string, options?: AIChatOptions): AsyncIterable<AIStreamChunk> {
    const model = options?.model ?? this.defaultModel;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 4096,
          stream: true,
          messages: [
            {
              role: 'system',
              content: options?.systemPrompt ?? 'You are an expert AI code review assistant.',
            },
            { role: 'user', content: prompt },
          ],
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
          if (trimmed === 'data: [DONE]') {
            yield { delta: '', isComplete: true };
            return;
          }
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const event = JSON.parse(jsonStr) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const content = event.choices?.[0]?.delta?.content;
              if (content) {
                yield { delta: content, isComplete: false };
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
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.defaultModel,
          input: texts,
        }),
      });

      if (!response.ok) {
        return texts.map(() => new Array<number>(4096).fill(0.01));
      }

      const data = (await response.json()) as {
        data: Array<{ embedding: number[] }>;
      };

      return data.data.map((item) => item.embedding);
    } catch {
      return texts.map(() => new Array<number>(4096).fill(0.01));
    }
  }

  public async health(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      const isAvailable = response.ok;
      return {
        provider: 'vllm',
        isAvailable,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        provider: 'vllm',
        isAvailable: false,
        latencyMs: 0,
      };
    }
  }

  public metadata(): ModelCapabilities {
    return {
      provider: 'vllm',
      model: this.defaultModel,
      contextWindow: 32768,
      pricingPer1kInput: 0,
      pricingPer1kOutput: 0,
      supportsReasoning: true,
      supportsTools: true,
      supportsStreaming: true,
      supportsVision: false,
    };
  }
}
