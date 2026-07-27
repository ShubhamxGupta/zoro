import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultModuleResolver } from './module-resolver.js';
import { ResolutionCache } from './resolution-cache.js';

describe('DefaultModuleResolver', () => {
  let cache: ResolutionCache;
  let resolver: DefaultModuleResolver;

  beforeEach(() => {
    cache = new ResolutionCache();
    resolver = new DefaultModuleResolver(cache);
  });

  it('resolves relative imports against available file list', async () => {
    const availableFiles = ['src/index.ts', 'src/services/user.ts', 'src/services/helper.ts'];

    const resolved = await resolver.resolveModule(
      {
        sourcePath: './helper',
        importedSymbols: ['formatUser'],
        isRelative: true,
        isWildcard: false,
      },
      'src/services/user.ts',
      availableFiles,
    );

    expect(resolved.isRelative).toBe(true);
    expect(resolved.resolvedFilePath).toBe('src/services/helper.ts');
  });

  it('resolves monorepo workspace package imports and hits cache on repeat', async () => {
    const availableFiles = ['packages/shared/src/index.ts', 'apps/web/src/main.ts'];

    const res1 = await resolver.resolveModule(
      {
        sourcePath: '@repo-intel/shared',
        importedSymbols: ['ASTTree'],
        isRelative: false,
        isWildcard: false,
      },
      'apps/web/src/main.ts',
      availableFiles,
    );

    expect(res1.resolvedFilePath).toBe('packages/shared/src/index.ts');

    const res2 = await resolver.resolveModule(
      {
        sourcePath: '@repo-intel/shared',
        importedSymbols: ['ASTTree'],
        isRelative: false,
        isWildcard: false,
      },
      'apps/web/src/main.ts',
      availableFiles,
    );

    expect(res2).toEqual(res1);
    const stats = resolver.getCacheStats();
    expect(stats.hits).toBe(1);
    expect(stats.hitRatio).toBeGreaterThan(0);
  });
});
