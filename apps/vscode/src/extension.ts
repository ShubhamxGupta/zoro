import type { ExplainableFinding } from '@repo-intel/shared';

export interface ExtensionDiagnostic {
  filePath: string;
  startLine: number;
  endLine: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  findingId: string;
  explanation: {
    whatIsWrong: string;
    whyItMatters: string;
    suggestedFix?: string;
  };
}

export class VSCodeExtensionClient {
  private diagnostics: Map<string, ExtensionDiagnostic[]> = new Map();

  public registerDiagnostics(findings: ExplainableFinding[]): void {
    this.diagnostics.clear();
    for (const f of findings) {
      const diag: ExtensionDiagnostic = {
        filePath: f.filePath,
        startLine: f.lineRange.startLine,
        endLine: f.lineRange.endLine,
        message: `[${f.category.toUpperCase()}] ${f.explanation.whatIsWrong}`,
        severity:
          f.severity === 'CRITICAL' || f.severity === 'HIGH'
            ? 'error'
            : f.severity === 'MEDIUM'
              ? 'warning'
              : 'info',
        category: f.category,
        findingId: f.findingId,
        explanation: {
          whatIsWrong: f.explanation.whatIsWrong,
          whyItMatters: f.explanation.whyItMatters,
          suggestedFix: (f.explanation as any).suggestedFix,
        },
      };

      const existing = this.diagnostics.get(f.filePath) ?? [];
      existing.push(diag);
      this.diagnostics.set(f.filePath, existing);
    }
  }

  public getHoverTooltip(filePath: string, line: number): string | null {
    const diags = this.diagnostics.get(filePath);
    if (!diags) return null;

    const match = diags.find((d) => line >= d.startLine && line <= d.endLine);
    if (!match) return null;

    return `### 🛡️ Repo Intelligence AI Finding [${match.category.toUpperCase()}]
**Problem:** ${match.explanation.whatIsWrong}
**Impact:** ${match.explanation.whyItMatters}
${match.explanation.suggestedFix ? `**Suggested Fix:** \`${match.explanation.suggestedFix}\`` : ''}`;
  }

  public getCodeActions(
    filePath: string,
    line: number,
  ): Array<{ title: string; command: string; findingId: string }> {
    const diags = this.diagnostics.get(filePath);
    if (!diags) return [];

    const matches = diags.filter((d) => line >= d.startLine && line <= d.endLine);
    return matches.map((m) => ({
      title: `💡 Apply AI Auto-Fix Patch for ${m.findingId}`,
      command: 'repo-intel.applyPatch',
      findingId: m.findingId,
    }));
  }
}

export function activate(): { client: VSCodeExtensionClient } {
  const client = new VSCodeExtensionClient();
  return { client };
}

export function deactivate(): void {
  // Graceful cleanup
}
