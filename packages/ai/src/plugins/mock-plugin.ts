import type {
  AIProviderPlugin,
  AIProvider,
  ModelCapabilities,
  ModelCapabilityMap,
} from '@repo-intel/shared';
import { MockAIProvider } from '../providers/mock-ai-provider.js';

export class MockPlugin implements AIProviderPlugin {
  public readonly name = 'mock';
  public readonly provider: AIProvider;
  public readonly models = ['mock-v1', 'mock-v2'];

  public readonly capabilities: ModelCapabilityMap = {
    chat: true,
    streaming: true,
    embeddings: true,
    functionCalling: true,
    vision: false,
    reasoning: false,
    jsonMode: true,
    tools: true,
    multimodalInput: false,
    longContext: false,
  };

  constructor() {
    this.provider = new MockAIProvider();
  }

  public get metadata(): ModelCapabilities {
    return {
      ...this.provider.metadata(),
      capabilities: this.capabilities,
    };
  }

  public async initialize(): Promise<void> {
    // No-op
  }

  public async dispose(): Promise<void> {
    // No-op
  }
}
