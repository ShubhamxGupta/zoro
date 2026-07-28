export interface RateLimiterOptions {
  maxRequestsPerMinute?: number;
  maxTokensPerMinute?: number;
}

export class TokenBucketRateLimiter {
  private maxRPM: number;
  private maxTPM: number;
  private requestTokens: number;
  private tokenCount: number;
  private lastRefill: number;

  constructor(options?: RateLimiterOptions) {
    this.maxRPM = options?.maxRequestsPerMinute ?? 60;
    this.maxTPM = options?.maxTokensPerMinute ?? 100000;
    this.requestTokens = this.maxRPM;
    this.tokenCount = this.maxTPM;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    if (elapsedSeconds > 0) {
      const requestsToAdd = (this.maxRPM / 60) * elapsedSeconds;
      const tokensToAdd = (this.maxTPM / 60) * elapsedSeconds;

      this.requestTokens = Math.min(this.maxRPM, this.requestTokens + requestsToAdd);
      this.tokenCount = Math.min(this.maxTPM, this.tokenCount + tokensToAdd);
      this.lastRefill = now;
    }
  }

  public tryAcquire(tokensRequired = 100): boolean {
    this.refill();
    if (this.requestTokens >= 1 && this.tokenCount >= tokensRequired) {
      this.requestTokens -= 1;
      this.tokenCount -= tokensRequired;
      return true;
    }
    return false;
  }

  public async acquire(tokensRequired = 100, maxWaitMs = 1000): Promise<boolean> {
    if (this.tryAcquire(tokensRequired)) return true;

    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      await new Promise((r) => setTimeout(r, 50));
      if (this.tryAcquire(tokensRequired)) return true;
    }
    return false;
  }
}
