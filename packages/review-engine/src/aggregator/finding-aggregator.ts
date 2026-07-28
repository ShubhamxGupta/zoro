import type { ExplainableFinding, FindingSeverity } from '@repo-intel/shared';
import { FindingDeduplicator } from './finding-deduplicator.js';

const SEVERITY_WEIGHTS: Record<FindingSeverity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export class FindingAggregator {
  public static aggregate(agentFindingLists: ExplainableFinding[][]): ExplainableFinding[] {
    const rawFlattened = agentFindingLists.flat();
    const deduplicated = FindingDeduplicator.deduplicate(rawFlattened);

    // Sort by Severity (CRITICAL > HIGH > MEDIUM > LOW) then Confidence Score
    return deduplicated.sort((a, b) => {
      const weightA = SEVERITY_WEIGHTS[a.severity] ?? 0;
      const weightB = SEVERITY_WEIGHTS[b.severity] ?? 0;

      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return b.confidenceScore - a.confidenceScore;
    });
  }
}
