import { describe, expect, it } from 'vitest';
import { GitHubWebhookHandler } from './github-webhook-handler.js';

describe('GitHubWebhookHandler Suite', () => {
  it('handles pull_request.opened webhook event and returns process result', async () => {
    const handler = new GitHubWebhookHandler();
    const result = await handler.handleWebhook({
      action: 'opened',
      number: 42,
      pull_request: {
        number: 42,
        head: { sha: 'abc1234', ref: 'feature/security-fix' },
        base: { sha: 'main123', ref: 'main' },
        title: 'Fix DOM XSS sink',
        user: { login: 'dev-user' },
      },
      repository: {
        owner: { login: 'acme-corp' },
        name: 'zoro',
        full_name: 'acme-corp/zoro',
      },
    });

    expect(result.handled).toBe(true);
    expect(result.action).toBe('opened');
    expect(result.prNumber).toBe(42);
    expect(result.findingsCount).toBeGreaterThan(0);
    expect(result.checkRunStatus).toBe('failure');
  });

  it('skips non-PR actions like closed or labeled', async () => {
    const handler = new GitHubWebhookHandler();
    const result = await handler.handleWebhook({
      action: 'closed',
      number: 42,
    });

    expect(result.handled).toBe(false);
    expect(result.checkRunStatus).toBe('skipped');
  });
});
