import type { ExplainableFinding } from '@repo-intel/shared';

export const VSCODE_APP_VERSION = '0.6.0';

export interface InlineDiagnosticDecoration {
  range: { startLine: number; endLine: number };
  message: string;
  severity: 'error' | 'warning' | 'info';
  findingId: string;
}

export function createDiagnosticDecorations(findings: ExplainableFinding[]): InlineDiagnosticDecoration[] {
  return findings.map((f) => ({
    range: f.lineRange,
    message: `[${f.category.toUpperCase()}] ${f.explanation.whatIsWrong} (${f.explanation.whyItMatters})`,
    severity: f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'error' : f.severity === 'MEDIUM' ? 'warning' : 'info',
    findingId: f.findingId,
  }));
}
