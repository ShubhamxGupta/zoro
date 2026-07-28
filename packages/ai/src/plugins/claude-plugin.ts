import type {
  AIProviderPlugin,
  AIProvider,
  ModelCapabilities,
  ModelCapabilityMap,
} from '@repo-intel/shared';
import { ClaudeProvider } from '../providers/claude-provider.js';

export class ClaudePlugin implements AIProviderPlugin {
  public readonly name = 'claude';
  public readonly provider: AIProvider;
  public readonly models = [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ];

  public readonly capabilities: ModelCapabilityMap = {
    chat: true,
    streaming: true,
    embeddings: false,
    functionCalling: true,
    vision: true,
    reasoning: true,
    jsonMode: true,
    tools: true,
    multimodalInput: true,
    longContext: true,
  };

  constructor(apiKey?: string, defaultModel = 'claude-3-5-sonnet-20241022') {
    this.provider = new ClaudeProvider(apiKey, defaultModel);
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
