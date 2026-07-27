import type { ResolvedModule, TypeInfo } from '@repo-intel/shared';

export interface CacheStats {
  hits: number;
  misses: number;
  hitRatio: number;
}

export class ResolutionCache {
  private readonly moduleCache = new Map<string, ResolvedModule>();
  private readonly typeCache = new Map<string, TypeInfo>();
  private hits = 0;
  private misses = 0;

  public getModule(key: string): ResolvedModule | undefined {
    const cached = this.moduleCache.get(key);
    if (cached) {
      this.hits++;
      return cached;
    }
    this.misses++;
    return undefined;
  }

  public setModule(key: string, result: ResolvedModule): void {
    this.moduleCache.set(key, result);
  }

  public getType(key: string): TypeInfo | undefined {
    const cached = this.typeCache.get(key);
    if (cached) {
      this.hits++;
      return cached;
    }
    this.misses++;
    return undefined;
  }

  public setType(key: string, result: TypeInfo): void {
    this.typeCache.set(key, result);
  }

  public getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRatio = total > 0 ? this.hits / total : 0;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRatio: Number(hitRatio.toFixed(3)),
    };
  }

  public clear(): void {
    this.moduleCache.clear();
    this.typeCache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}
