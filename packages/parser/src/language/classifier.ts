import path from 'node:path';
import type { ClassifiedFile, FileCategory, LanguageId } from '@repo-intel/shared';
import type { ScannedFile } from '../scanner/scanner.types.js';
import { getLanguageSpecByExtension } from './registry.js';
import { detectLanguageByShebang } from './shebang.js';

const CONFIG_FILENAMES = new Set([
  'package.json',
  'tsconfig.json',
  'tsconfig.base.json',
  'pnpm-workspace.yaml',
  'vitest.config.ts',
  'playwright.config.ts',
  'next.config.js',
  'next.config.mjs',
  '.eslintrc.json',
  '.prettierrc',
  'go.mod',
  'Cargo.toml',
  'pyproject.toml',
]);

const TEST_FILE_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /_test\.go$/,
  /test_.*\.py$/,
  /.*_test\.py$/,
];

const TEST_DIR_PATTERNS = [
  /\/__tests__\//,
  /\/tests?\//,
  /\/e2e\//,
];

export async function classifyFile(file: ScannedFile): Promise<ClassifiedFile> {
  const normalizedPath = file.relativePath.replace(/\\/g, '/');
  const filename = path.basename(normalizedPath);
  const ext = path.extname(normalizedPath).toLowerCase();

  if (file.isBinary) {
    return {
      relativePath: file.relativePath,
      absolutePath: file.absolutePath,
      languageId: 'unknown',
      category: 'binary',
      isSupportedByParser: false,
      sizeInBytes: file.sizeInBytes,
      mtimeMs: file.mtimeMs,
      isBinary: true,
      sha256: file.sha256,
    };
  }

  let languageId: LanguageId = 'unknown';
  let category: FileCategory = 'unknown';
  let treeSitterGrammar: string | undefined;
  let isSupportedByParser = false;

  const spec = getLanguageSpecByExtension(ext);
  if (spec) {
    languageId = spec.languageId;
    category = spec.defaultCategory;
    treeSitterGrammar = spec.treeSitterGrammar;
    isSupportedByParser = spec.isSupportedByParser;
  } else {
    // Fallback: Shebang detection for files without standard extensions
    const shebangLang = await detectLanguageByShebang(file.absolutePath);
    if (shebangLang) {
      languageId = shebangLang;
      category = 'source';
      const shebangSpec = getLanguageSpecByExtension(shebangLang === 'javascript' ? '.js' : '.py');
      treeSitterGrammar = shebangSpec?.treeSitterGrammar;
      isSupportedByParser = shebangSpec?.isSupportedByParser ?? false;
    }
  }

  // Refine File Category via heuristics
  if (CONFIG_FILENAMES.has(filename) || normalizedPath.includes('/config/')) {
    category = 'config';
  } else if (
    TEST_FILE_PATTERNS.some((pattern) => pattern.test(normalizedPath)) ||
    TEST_DIR_PATTERNS.some((pattern) => pattern.test(`/${normalizedPath}`))
  ) {
    category = 'test';
  } else if (['.md', '.markdown', '.mdx', '.txt'].includes(ext)) {
    category = 'documentation';
  } else if (normalizedPath.includes('/dist/') || normalizedPath.includes('/generated/')) {
    category = 'generated';
  }

  return {
    relativePath: file.relativePath,
    absolutePath: file.absolutePath,
    languageId,
    category,
    treeSitterGrammar,
    isSupportedByParser,
    sizeInBytes: file.sizeInBytes,
    mtimeMs: file.mtimeMs,
    isBinary: file.isBinary,
    sha256: file.sha256,
  };
}
