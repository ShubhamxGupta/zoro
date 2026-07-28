import type { ExplainableFinding } from '@repo-intel/shared';

export class UnifiedPatchGenerator {
  public static generatePatch(finding: ExplainableFinding, originalCode: string): string {
    const file = finding.filePath;
    const fix = finding.suggestedFix?.description || 'Suggested fix';
    const lines = originalCode.split('\n');
    const startLine = finding.lineRange.startLine;

    const header = `--- a/${file}\n+++ b/${file}\n@@ -${startLine},3 +${startLine},4 @@\n`;
    const diffBody = ` ${lines[startLine - 1] || '// original line'}\n-${lines[startLine] || '// line to replace'}\n+${lines[startLine] || '// line to replace'} // FIX: ${fix}\n ${lines[startLine + 1] || '// next line'}\n`;

    return header + diffBody;
  }
}
