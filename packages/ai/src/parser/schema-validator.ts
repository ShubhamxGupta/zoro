import type { ExplainableFinding, FindingCategory, FindingSeverity } from '@repo-intel/shared';

const VALID_CATEGORIES: FindingCategory[] = [
  'syntax',
  'logic',
  'security',
  'performance',
  'architecture',
  'naming',
  'documentation',
  'testing',
  'complexity',
];

const VALID_SEVERITIES: FindingSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export class SchemaValidator {
  public static validateFindings(parsedJson: any): {
    success: boolean;
    findings: ExplainableFinding[];
    error?: string;
  } {
    if (!parsedJson) {
      return { success: false, findings: [], error: 'Payload is null or undefined.' };
    }

    const items = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
    const findings: ExplainableFinding[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || typeof item !== 'object') {
        return { success: false, findings: [], error: `Item at index ${i} is not an object.` };
      }

      if (!item.filePath || typeof item.filePath !== 'string') {
        return {
          success: false,
          findings: [],
          error: `Item at index ${i} missing required string "filePath".`,
        };
      }

      if (
        !item.explanation ||
        typeof item.explanation !== 'object' ||
        !item.explanation.whatIsWrong
      ) {
        return {
          success: false,
          findings: [],
          error: `Item at index ${i} missing required "explanation.whatIsWrong".`,
        };
      }

      const category: FindingCategory = VALID_CATEGORIES.includes(item.category)
        ? item.category
        : 'logic';
      const severity: FindingSeverity = VALID_SEVERITIES.includes(item.severity)
        ? item.severity
        : 'MEDIUM';

      const startLine = item.lineRange?.startLine ?? item.location?.startLine ?? 1;
      const endLine = item.lineRange?.endLine ?? item.location?.endLine ?? startLine;

      const finding: ExplainableFinding = {
        findingId: item.findingId || item.id || `finding-${Date.now()}-${i}`,
        agentId: item.agentId || 'AIReviewAgent',
        category,
        severity,
        confidenceScore: typeof item.confidenceScore === 'number' ? item.confidenceScore : 0.9,
        filePath: item.filePath,
        lineRange: { startLine, endLine },
        explanation: {
          whatIsWrong: item.explanation.whatIsWrong,
          whyItMatters: item.explanation.whyItMatters || 'May lead to software defects.',
          impactedComponents: Array.isArray(item.explanation.impactedComponents)
            ? item.explanation.impactedComponents
            : [],
        },
        evidenceChain: Array.isArray(item.evidenceChain) ? item.evidenceChain : [],
        suggestedFix: item.suggestedFix
          ? { description: item.suggestedFix.description || item.suggestedFix }
          : undefined,
      };

      findings.push(finding);
    }

    return { success: true, findings };
  }
}
