import fs from 'node:fs/promises';
import path from 'node:path';
import ignore, { type Ignore } from 'ignore';

const DEFAULT_ALWAYS_IGNORED = [
  '.git',
  '.git/**',
  'node_modules',
  'node_modules/**',
  'dist',
  'dist/**',
  '.next',
  '.next/**',
  'coverage',
  'coverage/**',
  '.DS_Store',
  'Thumbs.db',
];

export class IgnoreEvaluator {
  private ig: Ignore;

  constructor(customPatterns: string[] = []) {
    const ignoreFactory = typeof ignore === 'function' ? ignore : (ignore as unknown as { default: () => Ignore }).default;
    this.ig = ignoreFactory();
    this.ig.add(DEFAULT_ALWAYS_IGNORED);
    if (customPatterns.length > 0) {
      this.ig.add(customPatterns);
    }
  }

  public async loadGitignore(rootPath: string): Promise<void> {
    const gitignorePath = path.join(rootPath, '.gitignore');
    try {
      const content = await fs.readFile(gitignorePath, 'utf-8');
      this.ig.add(content);
    } catch {
      // .gitignore does not exist or is unreadable
    }

    const customIgnorePath = path.join(rootPath, '.repo-intel-ignore');
    try {
      const customContent = await fs.readFile(customIgnorePath, 'utf-8');
      this.ig.add(customContent);
    } catch {
      // .repo-intel-ignore does not exist
    }
  }

  public isIgnored(relativePath: string): boolean {
    if (!relativePath || relativePath === '.' || relativePath === '/') {
      return false;
    }
    const normalized = relativePath.replace(/\\/g, '/');
    return this.ig.ignores(normalized);
  }
}
