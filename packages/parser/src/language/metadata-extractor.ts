import path from 'node:path';
import fs from 'node:fs/promises';
import type {
  RepoMetadata,
  LanguageId,
  PackageManagerId,
  FrameworkHint,
  FileCategory,
  LanguageStat,
} from '@repo-intel/shared';
import type { ScannedFile } from '../scanner/scanner.types.js';
import { classifyFile } from './classifier.js';

export async function extractRepoMetadata(
  files: ScannedFile[],
  rootPath: string,
): Promise<RepoMetadata> {
  const classified = await Promise.all(files.map((file) => classifyFile(file)));

  let totalBytes = 0;
  let totalSourceFiles = 0;
  let totalTestFiles = 0;

  const categoryBreakdown: Record<FileCategory, number> = {
    source: 0,
    test: 0,
    config: 0,
    documentation: 0,
    generated: 0,
    binary: 0,
    asset: 0,
    unknown: 0,
  };

  const rawStats: Map<LanguageId, { fileCount: number; totalBytes: number }> = new Map();

  for (const file of classified) {
    categoryBreakdown[file.category]++;

    if (file.category === 'source') totalSourceFiles++;
    if (file.category === 'test') totalTestFiles++;

    totalBytes += file.sizeInBytes;

    if (file.languageId !== 'unknown') {
      const existing = rawStats.get(file.languageId) ?? { fileCount: 0, totalBytes: 0 };
      existing.fileCount++;
      existing.totalBytes += file.sizeInBytes;
      rawStats.set(file.languageId, existing);
    }
  }

  // Calculate Language Distribution Percentages
  const languageDistribution: Record<string, LanguageStat> = {};
  let maxBytes = -1;
  let primaryLanguage: LanguageId = 'unknown';

  for (const [langId, stat] of rawStats.entries()) {
    const percentage = totalBytes > 0 ? Math.round((stat.totalBytes / totalBytes) * 1000) / 10 : 0;
    languageDistribution[langId] = {
      fileCount: stat.fileCount,
      totalBytes: stat.totalBytes,
      percentage,
    };

    if (stat.totalBytes > maxBytes) {
      maxBytes = stat.totalBytes;
      primaryLanguage = langId;
    }
  }

  // Detect Package Manager & Framework Hints
  const packageManager = await detectPackageManager(rootPath);
  const detectedFrameworks = await detectFrameworks(rootPath, classified);

  return {
    rootPath,
    primaryLanguage,
    packageManager,
    detectedFrameworks,
    languageDistribution,
    fileCategoryBreakdown: categoryBreakdown,
    totalFiles: classified.length,
    totalSourceFiles,
    totalTestFiles,
    totalBytes,
  };
}

async function detectPackageManager(rootPath: string): Promise<PackageManagerId> {
  const check = async (file: string) => {
    try {
      await fs.access(path.join(rootPath, file));
      return true;
    } catch {
      return false;
    }
  };

  if (await check('pnpm-lock.yaml')) return 'pnpm';
  if (await check('package-lock.json')) return 'npm';
  if (await check('yarn.lock')) return 'yarn';
  if (await check('Cargo.lock')) return 'cargo';
  if (await check('go.sum')) return 'gomod';
  if (await check('poetry.lock')) return 'poetry';
  if (await check('requirements.txt')) return 'pip';

  return 'unknown';
}

async function detectFrameworks(rootPath: string, files: Array<{ relativePath: string }>): Promise<FrameworkHint[]> {
  const frameworks = new Set<FrameworkHint>();

  const hasFile = (name: string) => files.some((f) => path.basename(f.relativePath) === name);

  if (hasFile('next.config.js') || hasFile('next.config.mjs')) {
    frameworks.add('next');
    frameworks.add('react');
  }

  try {
    const pkgJsonPath = path.join(rootPath, 'package.json');
    const content = await fs.readFile(pkgJsonPath, 'utf-8');
    const pkg = JSON.parse(content) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps['next']) frameworks.add('next');
    if (deps['react']) frameworks.add('react');
    if (deps['fastify']) frameworks.add('fastify');
    if (deps['express']) frameworks.add('express');
  } catch {
    // package.json missing or invalid
  }

  return Array.from(frameworks);
}
