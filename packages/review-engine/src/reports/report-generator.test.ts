import { describe, it, expect } from 'vitest';
import { ReviewReportGenerator } from './report-generator.js';
import type { ReviewSummary } from '@repo-intel/shared';

describe('ReviewReportGenerator Suite', () => {
  const sampleSummary: ReviewSummary = {
    prId: 'pr-42',
    prNumber: 42,
    status: 'COMPLETED',
    executiveSummary: 'Automated PR code review finished with zero critical vulnerabilities.',
    findingsCount: 1,
    severityDistribution: { CRITICAL: 0, HIGH: 1, MEDIUM: 0, LOW: 0 },
    findings: [
      {
        findingId: 'finding-1',
        agentId: 'BugDetectionAgent',
        category: 'logic',
        severity: 'HIGH',
        filePath: 'src/user.ts',
        lineRange: { startLine: 24, endLine: 25 },
        explanation: {
          whatIsWrong: 'Potential dereference of undefined user object.',
          whyItMatters: 'Causes runtime TypeError crash.',
          impactedComponents: ['UserService'],
        },
        evidenceChain: [],
        suggestedFix: {
          description: 'Add optional chaining user?.id.',
        },
        confidenceScore: 0.95,
      },
    ],
    suggestedPatchesCount: 1,
    confidenceScore: 0.95,
    riskAssessment: 'Low Risk',
    reviewedAt: new Date().toISOString(),
  };

  it('generates valid Markdown report', () => {
    const generator = new ReviewReportGenerator();
    const md = generator.generateMarkdown(sampleSummary);

    expect(md).toContain('# AI Code Review Summary — PR #42');
    expect(md).toContain('logic');
    expect(md).toContain('src/user.ts:24');
  });

  it('generates valid HTML report', () => {
    const generator = new ReviewReportGenerator();
    const html = generator.generateHTML(sampleSummary);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('AI Review Summary PR #42');
  });

  it('generates valid JSON report', () => {
    const generator = new ReviewReportGenerator();
    const jsonStr = generator.generateJSON(sampleSummary);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.prNumber).toBe(42);
    expect(parsed.findingsCount).toBe(1);
  });

  it('generates valid SARIF report', () => {
    const generator = new ReviewReportGenerator();
    const sarif = generator.generateSARIF(sampleSummary);

    expect(sarif.version).toBe('2.1.0');
    expect(sarif.runs[0]?.tool.driver.name).toBe('RepoIntelligencePlatform');
    expect(sarif.runs[0]?.results[0]?.ruleId).toBe('finding-1');
  });
});
