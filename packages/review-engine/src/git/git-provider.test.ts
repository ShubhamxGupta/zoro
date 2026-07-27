import { describe, it, expect } from 'vitest';
import { LocalGitProvider } from './local-git-provider.js';

describe('LocalGitProvider', () => {
  it('returns repository metadata and commit history', async () => {
    const provider = new LocalGitProvider();
    const repo = await provider.getRepository();

    expect(repo.name).toBe('zoro');
    expect(repo.currentBranch).toBe('main');

    const commit = await provider.getCommit('a1b2c3d4');
    expect(commit.hash).toBe('a1b2c3d4');
  });
});
