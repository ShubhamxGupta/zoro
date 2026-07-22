import { describe, bench } from 'vitest';
import path from 'node:path';
import { walkRepository } from './repo-walker.js';

describe('Repository File Walker Benchmark', () => {
  bench('walk current repository workspace', async () => {
    await walkRepository({
      rootPath: path.resolve(process.cwd()),
      computeHashes: false,
    });
  });

  bench('walk current repository workspace with sha256 hashing', async () => {
    await walkRepository({
      rootPath: path.resolve(process.cwd()),
      computeHashes: true,
    });
  });
});
