import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultTypeResolver } from './type-resolver.js';
import { ResolutionCache } from './resolution-cache.js';

describe('DefaultTypeResolver', () => {
  let cache: ResolutionCache;
  let resolver: DefaultTypeResolver;

  beforeEach(() => {
    cache = new ResolutionCache();
    resolver = new DefaultTypeResolver(cache);
  });

  it('identifies primitives vs complex user-defined types', async () => {
    const stringType = await resolver.resolveType('string', 'src/main.ts');
    expect(stringType.isPrimitive).toBe(true);
    expect(stringType.resolvedSymbolId).toBeUndefined();

    const userType = await resolver.resolveType('UserService', 'src/main.ts');
    expect(userType.isPrimitive).toBe(false);
    expect(userType.resolvedSymbolId).toBe('symbol::src/main.ts::UserService');
  });

  it('parses generic types and array types', async () => {
    const listType = await resolver.resolveType('Promise<User[]>', 'src/main.ts');
    expect(listType.isGeneric).toBe(true);
    expect(listType.genericTypeArguments).toEqual(['User[]']);
  });
});
