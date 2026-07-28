import type { PullRequest, ReviewComment } from '@repo-intel/shared';

export interface GitHubClientOptions {
  token?: string;
  baseUrl?: string;
}

export class GitHubClient {
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(options?: GitHubClientOptions) {
    this.token = options?.token ?? process.env['GITHUB_TOKEN'] ?? 'mock-token';
    this.baseUrl = (options?.baseUrl ?? 'https://api.github.com').replace(/\/$/, '');
  }

  public async getPullRequest(owner: string, repo: string, prNumber: number): Promise<PullRequest> {
    if (this.token === 'mock-token') {
      return {
        id: `pr-${owner}-${repo}-${prNumber}`,
        number: prNumber,
        title: `PR #${prNumber}: Implement Resilient AI Provider Router`,
        description: 'Adds rate limiting, exponential backoff, and multi-provider failover chains.',
        author: 'developer-dev',
        sourceBranch: 'feature/ai-router',
        targetBranch: 'main',
        status: 'OPEN',
        repositoryUrl: `https://github.com/${owner}/${repo}`,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        commitsCount: 3,
        changedFilesCount: 4,
        additions: 150,
        deletions: 20,
      };
    }

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error (${response.status}): Unable to fetch PR #${prNumber}`);
    }

    const data = (await response.json()) as any;
    return {
      id: String(data.id),
      number: data.number,
      title: data.title,
      description: data.body || '',
      author: data.user?.login || 'unknown',
      sourceBranch: data.head?.ref || 'feature',
      targetBranch: data.base?.ref || 'main',
      status: data.state === 'closed' ? (data.merged ? 'MERGED' : 'CLOSED') : 'OPEN',
      repositoryUrl: data.html_url || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      commitsCount: data.commits || 0,
      changedFilesCount: data.changed_files || 0,
      additions: data.additions || 0,
      deletions: data.deletions || 0,
    };
  }

  public async postReviewSummary(
    owner: string,
    repo: string,
    prNumber: number,
    summaryMarkdown: string,
  ): Promise<{ success: boolean; commentId: string }> {
    if (this.token === 'mock-token') {
      return { success: true, commentId: `comment-mock-${Date.now()}` };
    }

    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: summaryMarkdown }),
      });

      if (!response.ok) {
        throw new Error(`GitHub API Error (${response.status}): Unable to post comment`);
      }

      const data = (await response.json()) as any;
      return { success: true, commentId: String(data.id) };
    } catch {
      return { success: false, commentId: '' };
    }
  }

  public async postInlineComment(
    owner: string,
    repo: string,
    prNumber: number,
    comment: ReviewComment,
    commitId: string,
  ): Promise<{ success: boolean; commentId: string }> {
    if (this.token === 'mock-token') {
      return { success: true, commentId: `inline-mock-${Date.now()}` };
    }

    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls/${prNumber}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: comment.body,
          commit_id: commitId,
          path: comment.filePath,
          line: comment.line || 1,
          side: comment.side || 'RIGHT',
        }),
      });

      if (!response.ok) {
        throw new Error(`GitHub API Error (${response.status}): Unable to post inline comment`);
      }

      const data = (await response.json()) as any;
      return { success: true, commentId: String(data.id) };
    } catch {
      return { success: false, commentId: '' };
    }
  }
}
