export class JSONExtractor {
  /**
   * Strip markdown code fences (```json ... ``` or ``` ... ```) and extract clean JSON.
   */
  public static extractJSON(rawContent: string): string {
    if (!rawContent) return '';

    let cleaned = rawContent.trim();

    // Strip markdown code blocks
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleaned = codeBlockMatch[1].trim();
    }

    // Locate first '[' or '{' and last ']' or '}'
    const firstBracket = cleaned.search(/[\{\[]/);
    if (firstBracket !== -1) {
      const lastObjIndex = cleaned.lastIndexOf('}');
      const lastArrIndex = cleaned.lastIndexOf(']');
      const lastBracket = Math.max(lastObjIndex, lastArrIndex);

      if (lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
      }
    }

    return cleaned;
  }
}
