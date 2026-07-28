import type { CacheStats } from '@repo-intel/shared';

export class PlatformCache {
  private readonly store = new Map<string, { value: any; expiresAt: number }>();
  private hits = 0;
  private misses = 0;

  public set(key: string, value: any, ttlSeconds = 300): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  public get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses += 1;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses += 1;
      return undefined;
    }
    this.hits += 1;
    return entry.value as T;
  }

  public clear(): void {
    this.store.clear();
  }

  public getStats(): CacheStats {
    const total = this.hits + this.misses || 1;
    return {
      hits: this.hits,
      misses: this.misses,
      keysCount: this.store.size,
      memoryUsageMb: Math.round((this.store.size * 512) / 1024 / 1024),
      hitRatioPercent: Math.round((this.hits / total) * 100),
    };
  }
}
