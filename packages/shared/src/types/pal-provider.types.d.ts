/**
 * Provider-Independent AI Platform Layer (PAL) Domain Models
 */
export interface ModelCapabilityMap {
    chat: boolean;
    streaming: boolean;
    embeddings: boolean;
    functionCalling: boolean;
    vision: boolean;
    reasoning: boolean;
    jsonMode: boolean;
    tools: boolean;
    multimodalInput: boolean;
    longContext: boolean;
}
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
    capabilities?: ModelCapabilityMap;
}
export interface ProviderHealthStatus {
    provider: string;
    isAvailable: boolean;
    latencyMs: number;
    error?: string;
    lastCheck?: string;
}
export interface ProviderHealthMetrics {
    provider: string;
    isAvailable: boolean;
    latencyMs: number;
    successRate: number;
    errorRate: number;
    totalRequests: number;
    activeModel: string;
    lastCheck: string;
}
export interface ProviderUsageMetrics {
    provider: string;
    requests: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    estimatedRamMb: number;
    avgLatencyMs: number;
}
export interface ProviderConfiguration {
    provider: string;
    apiKey?: string;
    endpoint?: string;
    timeoutMs?: number;
    retryPolicy?: {
        maxRetries: number;
        backoffMs: number;
    };
    streamingOptions?: {
        enabled: boolean;
    };
    temperature?: number;
    maxTokens?: number;
    defaultModel?: string;
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
export interface AIProviderPlugin {
    readonly name: string;
    readonly metadata: ModelCapabilities;
    readonly provider: AIProvider;
    readonly models: string[];
    readonly capabilities: ModelCapabilityMap;
    initialize(): Promise<void>;
    dispose(): Promise<void>;
}
//# sourceMappingURL=pal-provider.types.d.ts.map