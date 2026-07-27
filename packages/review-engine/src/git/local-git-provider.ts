import type {
  GitBranch,
  GitCommit,
  GitDiff,
  GitProvider,
  GitPullRequest,
  GitRepository,
  StructuredDiffSymbolChange,
} from '@repo-intel/shared';

export class LocalGitProvider implements GitProvider {
  constructor(
    private readonly repoPath = '.',
    private readonly branchName = 'main',
  ) {}

  public async getRepository(): Promise<GitRepository> {
    return {
      name: 'zoro',
      rootPath: this.repoPath,
      currentBranch: this.branchName,
      headCommit: 'a1b2c3d4e5f6',
    };
  }

  public async getBranches(): Promise<GitBranch[]> {
    return [
      { name: 'main', commitHash: 'a1b2c3d4e5f6', isRemote: false },
      { name: 'feature/phase-19', commitHash: 'b2c3d4e5f6a1', isRemote: false },
    ];
  }

  public async getCommit(hash: string): Promise<GitCommit> {
    return {
      hash,
      author: 'Antigravity Developer',
      email: 'dev@repo-intel.io',
      message: `Commit ${hash.substring(0, 7)}: Feature update`,
      timestamp: new Date().toISOString(),
    };
  }

  public async getDiff(sourceCommit: string, targetCommit: string): Promise<GitDiff> {
    const rawDiff = `diff --git a/src/user.ts b/src/user.ts
index e69de29..b2c3d4e 100644
--- a/src/user.ts
+++ b/src/user.ts
@@ -10,3 +10,4 @@ export class UserService {
+  public async getUser(id: string) {}
`;
    return {
      rawDiff,
      sourceCommit,
      targetCommit,
      changedFilesCount: 1,
    };
  }

  public async getPullRequest(prNumber: number): Promise<GitPullRequest> {
    return {
      id: `pr-${prNumber}`,
      number: prNumber,
      title: `Pull Request #${prNumber}`,
      author: 'antigravity-bot',
      sourceBranch: 'feature/phase-19',
      targetBranch: 'main',
      headCommit: 'a1b2c3d4e5f6',
    };
  }

  public async getChangedFiles(_sourceCommit: string, _targetCommit: string): Promise<string[]> {
    return ['src/user.ts'];
  }

  public async getChangedSymbols(
    _sourceCommit: string,
    _targetCommit: string,
  ): Promise<StructuredDiffSymbolChange[]> {
    return [
      {
        symbolName: 'getUser',
        kind: 'function',
        changeType: 'added',
        filePath: 'src/user.ts',
      },
    ];
  }
}
