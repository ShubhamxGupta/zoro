import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { classifyFile } from './classifier.js';
import { detectLanguageByShebang } from './shebang.js';
import { extractRepoMetadata } from './metadata-extractor.js';
import type { ScannedFile } from '../scanner/scanner.types.js';

describe('Language Classifier & Repository Metadata Suite', () => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zoro-lang-test-'));
    await fs.writeFile(path.join(tempDir, 'pnpm-lock.yaml'), 'lockfile content');
    await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify({ dependencies: { next: '^14.0.0', react: '^18.0.0' } }));
    await fs.writeFile(path.join(tempDir, 'cli.js'), '#!/usr/bin/env node\nconsole.log("hello");');
  });

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Cleanup
    }
  });

  test('classifies extension-based files correctly', async () => {
    const tsFile: ScannedFile = {
      relativePath: 'src/main.ts',
      absolutePath: path.join(tempDir, 'src/main.ts'),
      sizeInBytes: 100,
      mtimeMs: Date.now(),
      isBinary: false,
    };

    const classified = await classifyFile(tsFile);
    expect(classified.languageId).toBe('typescript');
    expect(classified.category).toBe('source');
    expect(classified.treeSitterGrammar).toBe('tree-sitter-typescript');
    expect(classified.isSupportedByParser).toBe(true);
  });

  test('classifies test files using path heuristics', async () => {
    const testFile: ScannedFile = {
      relativePath: 'src/components/button.test.tsx',
      absolutePath: path.join(tempDir, 'src/components/button.test.tsx'),
      sizeInBytes: 250,
      mtimeMs: Date.now(),
      isBinary: false,
    };

    const classified = await classifyFile(testFile);
    expect(classified.languageId).toBe('typescript');
    expect(classified.category).toBe('test');
  });

  test('detects shebang script headers', async () => {
    const shebangPath = path.join(tempDir, 'cli.js');
    const detected = await detectLanguageByShebang(shebangPath);
    expect(detected).toBe('javascript');
  });

  test('extractRepoMetadata calculates primary language, package manager, and framework hints', async () => {
    const mockFiles: ScannedFile[] = [
      { relativePath: 'src/app.ts', absolutePath: path.join(tempDir, 'src/app.ts'), sizeInBytes: 1000, mtimeMs: Date.now(), isBinary: false },
      { relativePath: 'src/util.ts', absolutePath: path.join(tempDir, 'src/util.ts'), sizeInBytes: 500, mtimeMs: Date.now(), isBinary: false },
      { relativePath: 'src/app.test.ts', absolutePath: path.join(tempDir, 'src/app.test.ts'), sizeInBytes: 300, mtimeMs: Date.now(), isBinary: false },
      { relativePath: 'README.md', absolutePath: path.join(tempDir, 'README.md'), sizeInBytes: 200, mtimeMs: Date.now(), isBinary: false },
    ];

    const meta = await extractRepoMetadata(mockFiles, tempDir);

    expect(meta.primaryLanguage).toBe('typescript');
    expect(meta.packageManager).toBe('pnpm');
    expect(meta.detectedFrameworks).toContain('next');
    expect(meta.detectedFrameworks).toContain('react');
    expect(meta.totalFiles).toBe(4);
    expect(meta.totalSourceFiles).toBe(2);
    expect(meta.totalTestFiles).toBe(1);
    expect(meta.languageDistribution['typescript']?.percentage).toBeGreaterThan(50);
  });
});
