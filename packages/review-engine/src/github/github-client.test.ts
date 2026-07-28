import { describe, it, expect } from 'vitest';
import { GitHubClient } from './github-client.js';

describe('GitHubClient Suite', () => {
  it('fetches PR details cleanly in mock token mode', async () => {
    const client = new GitHubClient({ token: 'mock-token' });
    const pr = await client.getPullRequest('owner', 'repo', 42);

    expect(pr.number).toBe(42);
    expect(pr.title).toContain('PR #42');
    expect(pr.author).toBe('developer-dev');
    expect(pr.status).toBe('OPEN');
  });

  it('posts PR review summary in mock token mode', async () => {
    const client = new GitHubClient({ token: 'mock-token' });
    const result = await client.postReviewSummary('owner', 'repo', 42, '### AI Code Review Passed');

    expect(result.success).toBe(true);
    expect(result.commentId).toContain('comment-mock');
  });

  it('posts inline review comment in mock token mode', async () => {
    const client = new GitHubClient({ token: 'mock-token' });
    const result = await client.postInlineComment(
      'owner',
      'repo',
      42,
      {
        id: 'comment-1',
        filePath: 'src/main.ts',
        line: 15,
        body: 'Consider handling potential null pointer exception.',
        createdAt: new Date().toISOString(),
      },
      'commit-sha-123',
    );

    expect(result.success).toBe(true);
    expect(result.commentId).toContain('inline-mock');
  });
});
