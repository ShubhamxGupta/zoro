export interface Poolable {
  reset(): void;
  dispose(): void;
}

export interface ParserPoolOptions {
  maxSize: number;
  idleTimeoutMs?: number;
}

interface PoolEntry<T extends Poolable> {
  instance: T;
  acquiredAt?: number;
  idleAt?: number;
}

export class ParserPool<T extends Poolable> {
  private available: Array<PoolEntry<T>> = [];
  private inUse = new Set<T>();
  private readonly maxSize: number;
  private readonly idleTimeoutMs: number;

  constructor(
    private readonly factory: () => T,
    options: ParserPoolOptions = { maxSize: 4 },
  ) {
    this.maxSize = options.maxSize;
    this.idleTimeoutMs = options.idleTimeoutMs ?? 30_000;
  }

  public acquire(): T {
    this.evictIdle();

    const entry = this.available.pop();
    if (entry) {
      entry.instance.reset();
      entry.acquiredAt = Date.now();
      this.inUse.add(entry.instance);
      return entry.instance;
    }

    if (this.inUse.size >= this.maxSize) {
      // At capacity — create a temporary overflow instance (will not return to pool)
      return this.factory();
    }

    const newInstance = this.factory();
    this.inUse.add(newInstance);
    return newInstance;
  }

  public release(instance: T): void {
    if (!this.inUse.has(instance)) return;
    this.inUse.delete(instance);

    if (this.available.length < this.maxSize) {
      this.available.push({ instance, idleAt: Date.now() });
    } else {
      // Pool is full — dispose the overflow instance
      instance.dispose();
    }
  }

  public get activeCount(): number {
    return this.inUse.size;
  }

  public get idleCount(): number {
    return this.available.length;
  }

  public get totalCapacity(): number {
    return this.maxSize;
  }

  public disposeAll(): void {
    for (const entry of this.available) {
      entry.instance.dispose();
    }
    this.available = [];

    for (const instance of this.inUse) {
      instance.dispose();
    }
    this.inUse.clear();
  }

  private evictIdle(): void {
    const now = Date.now();
    this.available = this.available.filter((entry) => {
      if (entry.idleAt && now - entry.idleAt > this.idleTimeoutMs) {
        entry.instance.dispose();
        return false;
      }
      return true;
    });
  }
}
