/**
 * AI Provider Abstraction Layer (PAL) Domain Models
 */

export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'ollama'
  | 'vllm'
  | 'openrouter'
  | 'groq'
  | 'deepseek'
  | 'lmstudio';

export interface ProviderConfig {
  providerId: string;
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface CapabilitiesMatrix {
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsZeroDataRetention: boolean;
  maxContextTokens: number;
}

export interface HealthStatus {
  isHealthy: boolean;
  providerId: string;
  latencyMs?: number;
  errorMessage?: string;
}

export interface CompletionRequest {
  requestId: string;
  systemPrompt: string;
  userPrompt: string;
  contextPayload?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CompletionResponse {
  requestId: string;
  providerId: string;
  modelName: string;
  content: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error';
  latencyMs: number;
}

export interface ProviderAdapter {
  initialize(config: ProviderConfig): Promise<void>;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  validateCapabilities(): CapabilitiesMatrix;
  getHealthStatus(): Promise<HealthStatus>;
}
