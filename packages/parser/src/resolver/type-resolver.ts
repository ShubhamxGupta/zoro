import type { TypeInfo, TypeResolver } from '@repo-intel/shared';
import { ResolutionCache } from './resolution-cache.js';

export class DefaultTypeResolver implements TypeResolver {
  private readonly primitives = new Set([
    'string',
    'number',
    'boolean',
    'any',
    'unknown',
    'void',
    'never',
    'null',
    'undefined',
    'int',
    'long',
    'float',
    'double',
    'char',
    'byte',
    'short',
  ]);

  constructor(private readonly cache: ResolutionCache = new ResolutionCache()) {}

  public async resolveType(typeString: string, contextFilePath: string): Promise<TypeInfo> {
    const cleanType = typeString.replace(/^:\s*/, '').trim();
    const cacheKey = `${contextFilePath}::${cleanType}`;

    const cached = this.cache.getType(cacheKey);
    if (cached) return cached;

    const isArray =
      cleanType.endsWith('[]') || cleanType.startsWith('Array<') || cleanType.startsWith('[]');
    const isNullable =
      cleanType.includes('null') || cleanType.includes('undefined') || cleanType.includes('?');

    const genericMatch = cleanType.match(/^([A-Za-z0-9_]+)<(.+)>$/);
    const isGeneric = genericMatch !== null;
    const genericTypeArguments = genericMatch
      ? genericMatch[2]?.split(',').map((s) => s.trim())
      : undefined;

    const baseType = genericMatch
      ? genericMatch[1]!
      : cleanType.replace(/\[\]$/, '').replace(/\?$/, '');
    const isPrimitive = this.primitives.has(baseType.toLowerCase());

    const result: TypeInfo = {
      rawType: cleanType,
      resolvedSymbolId: isPrimitive ? undefined : `symbol::${contextFilePath}::${baseType}`,
      isPrimitive,
      isGeneric,
      genericTypeArguments,
      isNullable,
      isArray,
    };

    this.cache.setType(cacheKey, result);
    return result;
  }

  public getCacheStats() {
    return this.cache.getStats();
  }
}
