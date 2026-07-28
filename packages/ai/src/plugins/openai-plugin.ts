import type {
  AIProviderPlugin,
  AIProvider,
  ModelCapabilities,
  ModelCapabilityMap,
} from '@repo-intel/shared';
import { OpenAIProvider } from '../providers/openai-provider.js';

export class OpenAIPlugin implements AIProviderPlugin {
  public readonly name = 'openai';
  public readonly provider: AIProvider;
  public readonly models = ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'];

  public readonly capabilities: ModelCapabilityMap = {
    chat: true,
    streaming: true,
    embeddings: true,
    functionCalling: true,
    vision: true,
    reasoning: true,
    jsonMode: true,
    tools: true,
    multimodalInput: true,
    longContext: true,
  };

  constructor(apiKey?: string, defaultModel = 'gpt-4o') {
    this.provider = new OpenAIProvider(apiKey, defaultModel);
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
