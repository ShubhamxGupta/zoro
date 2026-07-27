import type { QueryIntent, QueryIntentCategory } from '@repo-intel/shared';

export class QueryAnalyzer {
  public analyze(queryText: string, categoryHint?: QueryIntentCategory): QueryIntent {
    const textLower = queryText.toLowerCase();
    const keywords = textLower.split(/\s+/).filter((w) => w.length > 2);

    let category: QueryIntentCategory = categoryHint ?? 'general_search';
    let confidence = categoryHint ? 0.95 : 0.7;

    if (!categoryHint) {
      if (/bug|error|crash|fail|null|exception|fix|issue|panic/.test(textLower)) {
        category = 'bug_investigation';
        confidence = 0.85;
      } else if (/perf|speed|latency|slow|mem|memory|bench|optimization/.test(textLower)) {
        category = 'performance';
        confidence = 0.85;
      } else if (
        /security|vulnerability|auth|token|cve|secret|leak|inject|xss|csrf/.test(textLower)
      ) {
        category = 'security';
        confidence = 0.9;
      } else if (/dep|import|package|module|version|build|manifest/.test(textLower)) {
        category = 'dependency';
        confidence = 0.8;
      } else if (/arch|structure|design|layer|component|system|flow/.test(textLower)) {
        category = 'architecture';
        confidence = 0.8;
      } else if (/refactor|rename|clean|extract|decouple|cleanup/.test(textLower)) {
        category = 'refactoring';
        confidence = 0.8;
      } else if (/doc|readme|comment|usage|guide|jsdoc|py-doc/.test(textLower)) {
        category = 'documentation';
        confidence = 0.85;
      }
    }

    const targetLanguages: string[] = [];
    if (/typescript|\.ts\b|js\b|node/.test(textLower)) targetLanguages.push('typescript');
    if (/python|\.py\b|django|flask/.test(textLower)) targetLanguages.push('python');
    if (/go\b|golang|\.go\b/.test(textLower)) targetLanguages.push('go');
    if (/java\b|\.java\b|spring/.test(textLower)) targetLanguages.push('java');

    return {
      category,
      confidence,
      keywords,
      targetLanguages: targetLanguages.length > 0 ? targetLanguages : undefined,
    };
  }
}
