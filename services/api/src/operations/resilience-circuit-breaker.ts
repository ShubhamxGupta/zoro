import type { CircuitBreakerState } from '@repo-intel/shared';

export class ResilienceCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failuresCount = 0;
  private readonly threshold = 3;

  constructor(public readonly serviceName: string) {}

  public async execute<T>(fn: () => Promise<T>, fallbackFn?: () => T): Promise<T> {
    if (this.state === 'OPEN') {
      if (fallbackFn) return fallbackFn();
      throw new Error(`[CircuitBreaker] Service ${this.serviceName} is currently OPEN.`);
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (err: any) {
      this.recordFailure();
      if (fallbackFn) return fallbackFn();
      throw err;
    }
  }

  public getState(): CircuitBreakerState {
    return {
      serviceName: this.serviceName,
      state: this.state,
      failuresCount: this.failuresCount,
    };
  }

  private recordFailure(): void {
    this.failuresCount += 1;
    if (this.failuresCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  private reset(): void {
    this.failuresCount = 0;
    this.state = 'CLOSED';
  }
}
