import fs from 'node:fs/promises';
import path from 'node:path';
import type { RepositoryFacts, RepoMetadata, ProjectScale } from '@repo-intel/shared';
import { detectAllFrameworks } from '../language/framework-detectors/index.js';

export async function extractRepositoryFacts(
  metadata: RepoMetadata,
  rootPath: string,
  relativeFiles: Array<{ relativePath: string }>,
): Promise<RepositoryFacts> {
  let packageJsonData: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } | undefined;
  try {
    const pkgContent = await fs.readFile(path.join(rootPath, 'package.json'), 'utf-8');
    packageJsonData = JSON.parse(pkgContent) as typeof packageJsonData;
  } catch {
    // package.json missing
  }

  // Run modular framework detectors with confidence scores
  const frameworks = await detectAllFrameworks({
    rootPath,
    files: relativeFiles,
    packageJson: packageJsonData,
  });

  const secondaryLanguages = Object.keys(metadata.languageDistribution)
    .filter((lang) => lang !== metadata.primaryLanguage)
    .map((l) => l as RepositoryFacts['primaryLanguage']);

  const hasFile = (name: string) => relativeFiles.some((f) => path.basename(f.relativePath) === name);

  const hasDocker = hasFile('Dockerfile') || hasFile('docker-compose.yml') || hasFile('docker-compose.yaml');
  const isMonorepo = hasFile('pnpm-workspace.yaml') || hasFile('lerna.json') || relativeFiles.some((f) => f.relativePath.startsWith('packages/'));
  const ciProvider = hasFile('.gitlab-ci.yml') ? 'GitLab CI' : relativeFiles.some((f) => f.relativePath.startsWith('.github/workflows/')) ? 'GitHub Actions' : 'None';

  let estimatedProjectScale: ProjectScale = 'SMALL';
  if (metadata.totalFiles > 5000 || metadata.totalBytes > 50 * 1024 * 1024) {
    estimatedProjectScale = 'ENTERPRISE';
  } else if (metadata.totalFiles > 1000 || metadata.totalBytes > 10 * 1024 * 1024) {
    estimatedProjectScale = 'LARGE';
  } else if (metadata.totalFiles > 100 || metadata.totalBytes > 1 * 1024 * 1024) {
    estimatedProjectScale = 'MEDIUM';
  }

  return {
    primaryLanguage: metadata.primaryLanguage,
    secondaryLanguages,
    frameworks,
    packageManager: metadata.packageManager,
    buildSystem: isMonorepo ? 'pnpm workspace' : 'npm/tsc',
    testFramework: hasFile('vitest.config.ts') ? 'Vitest' : 'Jest/Unknown',
    ciProvider,
    hasDocker,
    isMonorepo,
    isGitRepo: true,
    totalSizeBytes: metadata.totalBytes,
    estimatedProjectScale,
  };
}
