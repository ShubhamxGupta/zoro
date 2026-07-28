export class TokenCounter {
  /**
   * Estimate token count for a string payload using model-specific character ratios.
   * Standard rule of thumb: ~4 characters per token for English text & source code.
   */
  public static countTokens(text: string, modelName = 'default'): number {
    if (!text) return 0;
    const len = text.length;

    const lowerModel = modelName.toLowerCase();
    if (lowerModel.includes('gpt-4') || lowerModel.includes('o1') || lowerModel.includes('o3')) {
      return Math.ceil(len / 3.7);
    }
    if (lowerModel.includes('claude')) {
      return Math.ceil(len / 3.8);
    }
    if (lowerModel.includes('llama') || lowerModel.includes('ollama') || lowerModel.includes('vllm')) {
      return Math.ceil(len / 3.5);
    }

    return Math.ceil(len / 4.0);
  }

  /**
   * Get maximum context window token limit for target model family.
   */
  public static getContextWindowLimit(modelName = 'default'): number {
    const lower = modelName.toLowerCase();
    if (lower.includes('claude-3-5-sonnet') || lower.includes('claude-3-opus')) return 200000;
    if (lower.includes('gpt-4o') || lower.includes('o1') || lower.includes('o3')) return 128000;
    if (lower.includes('vllm')) return 32768;
    if (lower.includes('llama3') || lower.includes('ollama') || lower.includes('qwen') || lower.includes('mistral')) return 8192;
    return 8192;
  }
}
