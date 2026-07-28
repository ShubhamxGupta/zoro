export interface RetryOptions {
  maxRetries?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  backoffFactor?: number;
}

export class ExponentialBackoffRetryHandler {
  private readonly maxRetries: number;
  private readonly initialBackoffMs: number;
  private readonly maxBackoffMs: number;
  private readonly backoffFactor: number;

  constructor(options?: RetryOptions) {
    this.maxRetries = options?.maxRetries ?? 3;
    this.initialBackoffMs = options?.initialBackoffMs ?? 100;
    this.maxBackoffMs = options?.maxBackoffMs ?? 2000;
    this.backoffFactor = options?.backoffFactor ?? 2;
  }

  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    let currentBackoff = this.initialBackoffMs;

    while (attempt <= this.maxRetries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt > this.maxRetries || !this.isRetryable(error)) {
          throw error;
        }

        const jitter = Math.random() * 0.2 * currentBackoff;
        const sleepTime = Math.min(this.maxBackoffMs, currentBackoff + jitter);
        await new Promise((resolve) => setTimeout(resolve, sleepTime));

        currentBackoff = Math.min(this.maxBackoffMs, currentBackoff * this.backoffFactor);
      }
    }

    throw new Error(`Max retries (${this.maxRetries}) exceeded.`);
  }

  private isRetryable(error: any): boolean {
    if (!error) return false;
    const msg = String(error.message || error).toLowerCase();
    // HTTP status 429 Rate Limit, 500, 502, 503, 504 or network timeout
    return (
      msg.includes('429') ||
      msg.includes('rate limit') ||
      msg.includes('500') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('504') ||
      msg.includes('fetch failed') ||
      msg.includes('network') ||
      msg.includes('timeout')
    );
  }
}
