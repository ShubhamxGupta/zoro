import type {
  AIProviderPlugin,
  AIProvider,
  ModelCapabilities,
  ModelCapabilityMap,
} from '@repo-intel/shared';
import { OllamaProvider } from '../providers/ollama-provider.js';

export class OllamaPlugin implements AIProviderPlugin {
  public readonly name = 'ollama';
  public readonly provider: AIProvider;
  public models = ['llama3', 'qwen2.5-coder', 'mistral-nemo', 'deepseek-coder', 'codellama', 'phi3'];

  public readonly capabilities: ModelCapabilityMap = {
    chat: true,
    streaming: true,
    embeddings: true,
    functionCalling: false,
    vision: false,
    reasoning: false,
    jsonMode: true,
    tools: false,
    multimodalInput: false,
    longContext: false,
  };

  private readonly ollamaProvider: OllamaProvider;

  constructor(baseUrl?: string, defaultModel = 'llama3') {
    this.ollamaProvider = new OllamaProvider(baseUrl, defaultModel);
    this.provider = this.ollamaProvider;
  }

  public get metadata(): ModelCapabilities {
    return {
      ...this.provider.metadata(),
      capabilities: this.capabilities,
    };
  }

  public async initialize(): Promise<void> {
    try {
      const localModels = await this.ollamaProvider.listLocalModels();
      if (localModels.length > 0) {
        this.models = localModels.map((m) => m.name);
      }
    } catch {
      // Keep defaults
    }
  }

  public async dispose(): Promise<void> {
    // No-op cleanup
  }
}
