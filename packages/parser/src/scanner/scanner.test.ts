import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { detectRepositoryRoot } from './root-detector.js';
import { IgnoreEvaluator } from './ignore-evaluator.js';
import { isBinaryFile } from './file-utils.js';
import { walkRepository } from './repo-walker.js';

describe('Repository Discovery & File Walker Engine', () => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zoro-scanner-test-'));
    // Setup mock directory structure
    await fs.mkdir(path.join(tempDir, '.git'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'src', 'components'), { recursive: true });
    await fs.mkdir(path.join(tempDir, 'node_modules', 'some-pkg'), { recursive: true });

    // Mock files
    await fs.writeFile(path.join(tempDir, 'package.json'), '{"name":"mock-pkg"}');
    await fs.writeFile(path.join(tempDir, 'src', 'index.ts'), 'console.log("hello");');
    await fs.writeFile(path.join(tempDir, 'src', 'components', 'button.tsx'), 'export const Button = () => null;');
    await fs.writeFile(path.join(tempDir, 'node_modules', 'some-pkg', 'index.js'), 'module.exports = {};');

    // Binary file mock
    const binaryBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x00, 0x00]);
    await fs.writeFile(path.join(tempDir, 'logo.png'), binaryBuffer);

    // .gitignore mock
    await fs.writeFile(path.join(tempDir, '.gitignore'), 'temp/\n*.log\n');
    await fs.mkdir(path.join(tempDir, 'temp'), { recursive: true });
    await fs.writeFile(path.join(tempDir, 'temp', 'cache.json'), '{}');
    await fs.writeFile(path.join(tempDir, 'debug.log'), 'error log content');
  });

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Cleanup fallback
    }
  });

  test('detectRepositoryRoot resolves .git root boundary', async () => {
    const boundary = await detectRepositoryRoot(path.join(tempDir, 'src', 'components'));
    expect(boundary.rootPath).toBe(tempDir);
    expect(boundary.isGitRepo).toBe(true);
    expect(boundary.markerFound).toBe('.git');
  });

  test('IgnoreEvaluator filters node_modules, .git, and .gitignore patterns', async () => {
    const evaluator = new IgnoreEvaluator();
    await evaluator.loadGitignore(tempDir);

    expect(evaluator.isIgnored('node_modules/some-pkg/index.js')).toBe(true);
    expect(evaluator.isIgnored('.git/config')).toBe(true);
    expect(evaluator.isIgnored('temp/cache.json')).toBe(true);
    expect(evaluator.isIgnored('debug.log')).toBe(true);
    expect(evaluator.isIgnored('src/index.ts')).toBe(false);
  });

  test('isBinaryFile detects binary content and extensions', async () => {
    const isPngBinary = await isBinaryFile(path.join(tempDir, 'logo.png'));
    const isTsBinary = await isBinaryFile(path.join(tempDir, 'src', 'index.ts'));

    expect(isPngBinary).toBe(true);
    expect(isTsBinary).toBe(false);
  });

  test('walkRepository discovers files while honoring ignores and progress', async () => {
    let progressCount = 0;
    const result = await walkRepository({
      rootPath: tempDir,
      computeHashes: true,
      onProgress: () => {
        progressCount++;
      },
    });

    expect(result.isCancelled).toBe(false);
    expect(result.totalFilesScanned).toBeGreaterThan(0);
    expect(progressCount).toBeGreaterThan(0);

    const relativePaths = result.files.map((f) => f.relativePath);
    expect(relativePaths).toContain('src/index.ts');
    expect(relativePaths).toContain('src/components/button.tsx');
    expect(relativePaths).toContain('package.json');
    expect(relativePaths).not.toContain('node_modules/some-pkg/index.js');
    expect(relativePaths).not.toContain('temp/cache.json');
    expect(relativePaths).not.toContain('debug.log');

    const indexFile = result.files.find((f) => f.relativePath === 'src/index.ts');
    expect(indexFile?.sha256).toBeDefined();
    expect(indexFile?.isBinary).toBe(false);
  });

  test('walkRepository respects AbortSignal cancellation', async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await walkRepository({
      rootPath: tempDir,
      signal: controller.signal,
    });

    expect(result.isCancelled).toBe(true);
  });
});
