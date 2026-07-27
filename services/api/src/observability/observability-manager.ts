export interface LogContext {
  correlationId?: string;
  service?: string;
  [key: string]: unknown;
}

export class ObservabilityManager {
  private readonly metrics = new Map<string, number>();

  public logInfo(message: string, context: LogContext = {}): void {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        context,
      }),
    );
  }

  public logError(message: string, error?: unknown, context: LogContext = {}): void {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        error: error instanceof Error ? error.message : String(error),
        context,
      }),
    );
  }

  public recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  public getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  public getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics.entries());
  }
}
