import type { ImportStatement, ModuleResolver, ResolvedModule } from '@repo-intel/shared';
import { ResolutionCache } from './resolution-cache.js';

export class DefaultModuleResolver implements ModuleResolver {
  constructor(private readonly cache: ResolutionCache = new ResolutionCache()) {}

  public async resolveModule(
    importStatement: ImportStatement,
    currentFilePath: string,
    availableFiles: string[],
  ): Promise<ResolvedModule> {
    const cacheKey = `${currentFilePath}::${importStatement.sourcePath}`;
    const cached = this.cache.getModule(cacheKey);
    if (cached) return cached;

    const sourcePath = importStatement.sourcePath;
    const isRelative = importStatement.isRelative;
    const isExternal = !isRelative && !sourcePath.startsWith('@repo-intel/');

    let resolvedFilePath: string | undefined;

    if (isRelative) {
      resolvedFilePath = this.resolveRelativePath(sourcePath, currentFilePath, availableFiles);
    } else if (sourcePath.startsWith('@repo-intel/')) {
      const pkgName = sourcePath.replace('@repo-intel/', '');
      resolvedFilePath = availableFiles.find((f) => f.includes(`packages/${pkgName}/`));
    }

    const resolvedModuleId = resolvedFilePath
      ? `file::${resolvedFilePath}`
      : `module::${sourcePath}`;

    const result: ResolvedModule = {
      sourcePath,
      resolvedFilePath,
      resolvedModuleId,
      isExternal,
      isRelative,
      namespace: sourcePath.split('/')[0],
    };

    this.cache.setModule(cacheKey, result);
    return result;
  }

  public getCacheStats() {
    return this.cache.getStats();
  }

  private resolveRelativePath(
    sourcePath: string,
    currentFilePath: string,
    availableFiles: string[],
  ): string | undefined {
    const currentDir = this.getDirectoryPath(currentFilePath);
    const normalizedParts = (currentDir ? `${currentDir}/${sourcePath}` : sourcePath)
      .replace(/\\/g, '/')
      .split('/');

    const stack: string[] = [];
    for (const part of normalizedParts) {
      if (part === '' || part === '.') continue;
      if (part === '..') {
        stack.pop();
      } else {
        stack.push(part);
      }
    }

    const candidateBasePath = stack.join('/');
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.js'];

    for (const ext of extensions) {
      const candidate = candidateBasePath + ext;
      const match = availableFiles.find(
        (f) => f === candidate || f.replace(/\\/g, '/') === candidate,
      );
      if (match) return match;
    }

    return candidateBasePath;
  }

  private getDirectoryPath(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/');
    const idx = normalized.lastIndexOf('/');
    return idx !== -1 ? normalized.substring(0, idx) : '';
  }
}
