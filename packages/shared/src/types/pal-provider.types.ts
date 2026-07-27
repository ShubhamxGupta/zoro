/**
 * Provider-Independent AI Platform Layer (PAL) Domain Models
 */

export interface ModelCapabilities {
  provider: string;
  model: string;
  contextWindow: number;
  pricingPer1kInput?: number;
  pricingPer1kOutput?: number;
  supportsReasoning: boolean;
  supportsTools: boolean;
  supportsStreaming: boolean;
  supportsVision: boolean;
}

export interface ProviderHealthStatus {
  provider: string;
  isAvailable: boolean;
  latencyMs: number;
  error?: string;
}

export interface AIChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: 'json' | 'text';
}

export interface AIChatResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}

export interface AIStreamChunk {
  delta: string;
  isComplete: boolean;
}

export interface AIProvider {
  chat(prompt: string, options?: AIChatOptions): Promise<AIChatResponse>;
  stream(prompt: string, options?: AIChatOptions): AsyncIterable<AIStreamChunk>;
  embeddings(texts: string[]): Promise<number[][]>;
  health(): Promise<ProviderHealthStatus>;
  metadata(): ModelCapabilities;
}
