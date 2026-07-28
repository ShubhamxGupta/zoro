import type { ReviewSummary, SARIFReport } from '@repo-intel/shared';

export class ReviewReportGenerator {
  public generateMarkdown(summary: ReviewSummary): string {
    const lines: string[] = [];
    lines.push(`# AI Code Review Summary — PR #${summary.prNumber}`);
    lines.push(``);
    lines.push(`**Status:** ${summary.status} | **Confidence Score:** ${summary.confidenceScore * 100}%`);
    lines.push(`**Reviewed At:** ${new Date(summary.reviewedAt).toUTCString()}`);
    lines.push(``);
    lines.push(`## Executive Summary`);
    lines.push(summary.executiveSummary);
    lines.push(``);
    lines.push(`## Severity Distribution`);
    lines.push(`- 🔴 **Critical:** ${summary.severityDistribution.CRITICAL}`);
    lines.push(`- 🟠 **High:** ${summary.severityDistribution.HIGH}`);
    lines.push(`- 🟡 **Medium:** ${summary.severityDistribution.MEDIUM}`);
    lines.push(`- 🔵 **Low:** ${summary.severityDistribution.LOW}`);
    lines.push(``);
    lines.push(`## Findings (${summary.findings.length})`);
    for (const f of summary.findings) {
      lines.push(`### [${f.severity}] ${f.category} — \`${f.filePath}:${f.lineRange.startLine}\``);
      lines.push(`- **Problem:** ${f.explanation.whatIsWrong}`);
      lines.push(`- **Why it Matters:** ${f.explanation.whyItMatters}`);
      if (f.suggestedFix) {
        lines.push(`- **Recommendation:** ${f.suggestedFix.description}`);
      }
      lines.push(``);
    }

    if (summary.riskAssessment) {
      lines.push(`## Risk Assessment`);
      lines.push(summary.riskAssessment);
    }

    return lines.join('\n');
  }

  public generateHTML(summary: ReviewSummary): string {
    const md = this.generateMarkdown(summary);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AI Review Summary PR #${summary.prNumber}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    h1, h2, h3 { color: #111827; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <pre>${md.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
  }

  public generateJSON(summary: ReviewSummary): string {
    return JSON.stringify(summary, null, 2);
  }

  public generateSARIF(summary: ReviewSummary): SARIFReport {
    return {
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'RepoIntelligencePlatform',
              version: '0.6.0',
              rules: summary.findings.map((f) => ({
                id: f.findingId,
                shortDescription: { text: f.category },
                fullDescription: { text: f.explanation.whatIsWrong },
                defaultConfiguration: {
                  level: f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'error' : 'warning',
                },
              })),
            },
          },
          results: summary.findings.map((f) => ({
            ruleId: f.findingId,
            message: { text: f.explanation.whatIsWrong },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: { uri: f.filePath },
                  region: { startLine: f.lineRange.startLine },
                },
              },
            ],
          })),
        },
      ],
    };
  }
}
