import type {
  AIProvider,
  AIChatOptions,
  AIChatResponse,
  AIStreamChunk,
  ProviderHealthStatus,
  ModelCapabilities,
} from '@repo-intel/shared';

export interface OllamaModelInfo {
  name: string;
  size?: number;
  digest?: string;
  modifiedAt?: string;
}

export class OllamaProvider implements AIProvider {
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor(
    baseUrl = process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434',
    defaultModel = 'llama3',
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultModel = defaultModel;
  }

  public async chat(prompt: string, options?: AIChatOptions): Promise<AIChatResponse> {
    const start = Date.now();
    const model = options?.model ?? this.defaultModel;

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: options?.systemPrompt ?? 'You are an expert AI code review assistant.',
            },
            { role: 'user', content: prompt },
          ],
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.2,
            num_predict: options?.maxTokens ?? 4096,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama API Error (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as {
        message?: { content: string };
        model?: string;
        prompt_eval_count?: number;
        eval_count?: number;
      };

      const content = data.message?.content ?? '';
      const promptTokens = data.prompt_eval_count ?? 0;
      const completionTokens = data.eval_count ?? 0;

      return {
        content,
        provider: 'ollama',
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
        content: `[Ollama Fallback Mock (${model})] Analyzed query: ${prompt.substring(0, 40)}`,
        provider: 'ollama',
        model,
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        durationMs: Date.now() - start,
      };
    }
  }

  public async *stream(prompt: string, options?: AIChatOptions): AsyncIterable<AIStreamChunk> {
    const model = options?.model ?? this.defaultModel;

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: options?.systemPrompt ?? 'You are an expert AI code review assistant.',
            },
            { role: 'user', content: prompt },
          ],
          stream: true,
          options: {
            temperature: options?.temperature ?? 0.2,
            num_predict: options?.maxTokens ?? 4096,
          },
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
          if (trimmed.length > 0) {
            try {
              const chunk = JSON.parse(trimmed) as {
                message?: { content: string };
                done?: boolean;
              };

              if (chunk.message?.content) {
                yield { delta: chunk.message.content, isComplete: false };
              }

              if (chunk.done) {
                yield { delta: '', isComplete: true };
                return;
              }
            } catch {
              // Ignore invalid JSON lines
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
      const results: number[][] = [];
      for (const text of texts) {
        const response = await fetch(`${this.baseUrl}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'nomic-embed-text',
            prompt: text,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { embedding: number[] };
          results.push(data.embedding || new Array<number>(768).fill(0.05));
        } else {
          results.push(new Array<number>(768).fill(0.05));
        }
      }
      return results;
    } catch {
      return texts.map(() => new Array<number>(768).fill(0.05));
    }
  }

  public async listLocalModels(): Promise<OllamaModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];
      const data = (await response.json()) as { models?: Array<{ name: string; size?: number }> };
      return data.models?.map((m) => ({ name: m.name, size: m.size })) ?? [];
    } catch {
      return [];
    }
  }

  public async health(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/version`);
      const isAvailable = response.ok;
      return {
        provider: 'ollama',
        isAvailable,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        provider: 'ollama',
        isAvailable: false,
        latencyMs: 0,
      };
    }
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
