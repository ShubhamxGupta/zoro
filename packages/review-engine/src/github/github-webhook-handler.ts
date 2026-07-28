import crypto from 'crypto';
import { GitHubClient } from './github-client.js';
import type { ExplainableFinding } from '@repo-intel/shared';

export interface GitHubWebhookPayload {
  action: 'opened' | 'synchronize' | 'reopened' | 'closed';
  number: number;
  pull_request?: {
    number: number;
    head: { sha: string; ref: string };
    base: { sha: string; ref: string };
    title: string;
    user: { login: string };
  };
  repository?: {
    owner: { login: string };
    name: string;
    full_name: string;
  };
}

export interface WebhookProcessResult {
  handled: boolean;
  action: string;
  prNumber: number;
  findingsCount: number;
  summaryCommentId?: string;
  checkRunStatus: 'success' | 'failure' | 'skipped';
}

export class GitHubWebhookHandler {
  private readonly client: GitHubClient;
  private readonly secret: string;

  constructor(client?: GitHubClient, secret = process.env['GITHUB_WEBHOOK_SECRET'] ?? '') {
    this.client = client ?? new GitHubClient();
    this.secret = secret;
  }

  public verifySignature(payloadRaw: string, signatureHeader?: string): boolean {
    if (!this.secret || !signatureHeader) return true; // Signature bypass in dev mode
    const expected = `sha256=${crypto.createHmac('sha256', this.secret).update(payloadRaw).digest('hex')}`;
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
  }

  public async handleWebhook(payload: GitHubWebhookPayload): Promise<WebhookProcessResult> {
    const action = payload.action;
    const prNumber = payload.number || payload.pull_request?.number || 0;
    const owner = payload.repository?.owner.login ?? 'owner';
    const repo = payload.repository?.name ?? 'repo';
    const headSha = payload.pull_request?.head.sha ?? 'HEAD';

    if (!['opened', 'synchronize', 'reopened'].includes(action)) {
      return {
        handled: false,
        action,
        prNumber,
        findingsCount: 0,
        checkRunStatus: 'skipped',
      };
    }

    // Mock AI multi-agent findings for PR analysis
    const sampleFindings: ExplainableFinding[] = [
      {
        findingId: `pr-sec-${Date.now()}`,
        agentId: 'SecurityAgent',
        category: 'security',
        severity: 'CRITICAL',
        confidenceScore: 0.98,
        filePath: 'packages/review-engine/src/agents/security-agent.ts',
        lineRange: { startLine: 18, endLine: 24 },
        explanation: {
          whatIsWrong: 'Potential DOM XSS sink detected via un-sanitized innerHTML assignment',
          whyItMatters: 'Allows arbitrary script injection into victim sessions',
          impactedComponents: ['SecurityAgent'],
        },
        evidenceChain: [],
      },
    ];

    const hasCritical = sampleFindings.some((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH');
    const checkRunStatus: 'success' | 'failure' = hasCritical ? 'failure' : 'success';

    // Post Markdown summary report to PR issue comments
    const summaryMd = `## 🤖 AI Multi-Agent Code Review Report for PR #${prNumber}

| Severity | Category | Target File | Description |
| :--- | :--- | :--- | :--- |
${sampleFindings
  .map(
    (f) =>
      `| **${f.severity}** | \`${f.category}\` | \`${f.filePath}\` | ${f.explanation.whatIsWrong} |`,
  )
  .join('\n')}

---
*Status Check:* **${checkRunStatus === 'success' ? '🟢 PASSED' : '🔴 FAILED'}** (1 Critical vulnerability detected)`;

    const summaryRes = await this.client.postReviewSummary(owner, repo, prNumber, summaryMd);

    // Post inline code review comments for each finding
    for (const f of sampleFindings) {
      await this.client.postInlineComment(
        owner,
        repo,
        prNumber,
        {
          id: f.findingId,
          filePath: f.filePath,
          line: f.lineRange.startLine,
          body: `⚠️ **[${f.severity}] ${f.category.toUpperCase()}**: ${f.explanation.whatIsWrong}\n\n*Impact:* ${f.explanation.whyItMatters}`,
          createdAt: new Date().toISOString(),
        },
        headSha,
      );
    }

    return {
      handled: true,
      action,
      prNumber,
      findingsCount: sampleFindings.length,
      summaryCommentId: summaryRes.commentId,
      checkRunStatus,
    };
  }
}
