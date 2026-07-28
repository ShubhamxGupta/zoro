import type {
  AIProviderPlugin,
  AIProvider,
  ModelCapabilities,
  ModelCapabilityMap,
} from '@repo-intel/shared';
import { VLLMProvider } from '../providers/vllm-provider.js';

export class VLLMPlugin implements AIProviderPlugin {
  public readonly name = 'vllm';
  public readonly provider: AIProvider;
  public readonly models = ['meta-llama/Meta-Llama-3-8B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.2'];

  public readonly capabilities: ModelCapabilityMap = {
    chat: true,
    streaming: true,
    embeddings: true,
    functionCalling: true,
    vision: false,
    reasoning: true,
    jsonMode: true,
    tools: true,
    multimodalInput: false,
    longContext: true,
  };

  constructor(baseUrl?: string, defaultModel?: string) {
    this.provider = new VLLMProvider(baseUrl, defaultModel);
  }

  public get metadata(): ModelCapabilities {
    return {
      ...this.provider.metadata(),
      capabilities: this.capabilities,
    };
  }

  public async initialize(): Promise<void> {
    await this.provider.health();
  }

  public async dispose(): Promise<void> {
    // No-op cleanup
  }
}
