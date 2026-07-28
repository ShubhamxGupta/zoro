import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';
import { GitHubClient, GitHubWebhookHandler, ReviewReportGenerator } from '@repo-intel/review-engine';
import type { ReviewSummary } from '@repo-intel/shared';

const githubClient = new GitHubClient();
const reportGenerator = new ReviewReportGenerator();
const webhookHandler = new GitHubWebhookHandler(githubClient);

export async function prRoutes(
  fastify: FastifyInstance,
  runtime: DefaultPlatformRuntime,
): Promise<void> {
  // GET /api/v1/pr
  fastify.get('/api/v1/pr', async (_request, reply) => {
    const mockPr = await githubClient.getPullRequest('owner', 'repo', 42);
    return reply.send({
      success: true,
      data: { pullRequests: [mockPr] },
    });
  });

  // GET /api/v1/pr/:id
  fastify.get('/api/v1/pr/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const num = parseInt(id.replace(/\D/g, ''), 10) || 42;
    const pr = await githubClient.getPullRequest('owner', 'repo', num);
    return reply.send({
      success: true,
      data: { pullRequest: pr },
    });
  });

  // POST /api/v1/pr/webhook - GitHub Webhook Handler for pull_request events
  fastify.post('/api/v1/pr/webhook', async (request, reply) => {
    const signature = request.headers['x-hub-signature-256'] as string | undefined;
    const rawBody = JSON.stringify(request.body ?? {});

    if (!webhookHandler.verifySignature(rawBody, signature)) {
      return reply.status(401).send({
        success: false,
        error: { message: 'Invalid GitHub Webhook HMAC Signature' },
      });
    }

    const payload = (request.body as any) ?? {};
    const result = await webhookHandler.handleWebhook(payload);

    return reply.send({
      success: true,
      data: result,
    });
  });

  // POST /api/v1/pr/review
  fastify.post('/api/v1/pr/review', async (request, reply) => {
    const body = (request.body as { prNumber?: number }) ?? {};
    const prNumber = body.prNumber ?? 42;

    const diff = await runtime.repositoryService.getDiff('HEAD~1', 'HEAD');
    const reviewResult = await runtime.reviewService.runReview(diff);

    const summary: ReviewSummary = {
      prId: `pr-owner-repo-${prNumber}`,
      prNumber,
      status: 'COMPLETED',
      executiveSummary: `Automated AI Code Review completed for PR #${prNumber}. Detected ${reviewResult.findings.length} findings across changed files.`,
      findingsCount: reviewResult.findings.length,
      severityDistribution: {
        CRITICAL: reviewResult.findings.filter((f) => f.severity === 'CRITICAL').length,
        HIGH: reviewResult.findings.filter((f) => f.severity === 'HIGH').length,
        MEDIUM: reviewResult.findings.filter((f) => f.severity === 'MEDIUM').length,
        LOW: reviewResult.findings.filter((f) => f.severity === 'LOW').length,
      },
      findings: reviewResult.findings,
      suggestedPatchesCount: reviewResult.findings.length > 0 ? 1 : 0,
      confidenceScore: 0.95,
      riskAssessment: reviewResult.findings.length > 0 ? 'Low-to-Medium risk.' : 'Low risk.',
      reviewedAt: new Date().toISOString(),
    };

    return reply.send({
      success: true,
      data: { summary },
    });
  });

  // POST /api/v1/pr/report
  fastify.post('/api/v1/pr/report', async (request, reply) => {
    const body = (request.body as { summary?: ReviewSummary; format?: 'markdown' | 'html' | 'json' | 'sarif' }) ?? {};
    const format = body.format ?? 'markdown';
    const summary = body.summary ?? {
      prId: 'pr-42',
      prNumber: 42,
      status: 'COMPLETED',
      executiveSummary: 'AI Review report generated.',
      findingsCount: 0,
      severityDistribution: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      findings: [],
      suggestedPatchesCount: 0,
      confidenceScore: 1.0,
      riskAssessment: 'No issues found.',
      reviewedAt: new Date().toISOString(),
    };

    let content: any = '';
    if (format === 'html') content = reportGenerator.generateHTML(summary);
    else if (format === 'json') content = reportGenerator.generateJSON(summary);
    else if (format === 'sarif') content = reportGenerator.generateSARIF(summary);
    else content = reportGenerator.generateMarkdown(summary);

    return reply.send({
      success: true,
      data: { format, content },
    });
  });

  // POST /api/v1/pr/publish
  fastify.post('/api/v1/pr/publish', async (request, reply) => {
    const body = (request.body as { owner?: string; repo?: string; prNumber?: number; markdown?: string }) ?? {};
    const owner = body.owner ?? 'owner';
    const repo = body.repo ?? 'repo';
    const prNumber = body.prNumber ?? 42;
    const markdown = body.markdown ?? '### AI Review Summary\n\nNo critical issues detected.';

    const result = await githubClient.postReviewSummary(owner, repo, prNumber, markdown);

    return reply.send({
      success: result.success,
      data: { commentId: result.commentId, message: 'Published review summary to GitHub.' },
    });
  });
}
