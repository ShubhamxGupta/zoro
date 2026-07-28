import type { ExplainableFinding } from '@repo-intel/shared';

export class FindingDeduplicator {
  /**
   * Merge findings that target the exact same file path and overlapping line ranges.
   */
  public static deduplicate(findings: ExplainableFinding[]): ExplainableFinding[] {
    if (!findings || findings.length === 0) return [];

    const result: ExplainableFinding[] = [];

    for (const current of findings) {
      const existingIdx = result.findIndex(
        (item) =>
          item.filePath === current.filePath &&
          item.category === current.category &&
          this.hasOverlappingLines(item.lineRange, current.lineRange),
      );

      if (existingIdx !== -1) {
        // Merge into higher confidence / severity finding
        const existing = result[existingIdx]!;
        result[existingIdx] = {
          ...existing,
          confidenceScore: Math.max(existing.confidenceScore, current.confidenceScore),
          explanation: {
            whatIsWrong: `${existing.explanation.whatIsWrong} (Merged: ${current.explanation.whatIsWrong})`,
            whyItMatters: existing.explanation.whyItMatters,
            impactedComponents: Array.from(
              new Set([...existing.explanation.impactedComponents, ...current.explanation.impactedComponents]),
            ),
          },
        };
      } else {
        result.push({ ...current });
      }
    }

    return result;
  }

  private static hasOverlappingLines(
    rangeA: { startLine: number; endLine: number },
    rangeB: { startLine: number; endLine: number },
  ): boolean {
    return Math.max(rangeA.startLine, rangeB.startLine) <= Math.min(rangeA.endLine, rangeB.endLine);
  }
}
