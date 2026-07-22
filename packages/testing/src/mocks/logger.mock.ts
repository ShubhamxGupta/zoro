import type { ILogger } from '@repo-intel/shared';

export interface MockLoggerRecord {
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string | object;
  meta?: unknown[];
}

export class MockLogger implements ILogger {
  public records: MockLoggerRecord[] = [];

  public info(message: string | object, ...meta: unknown[]): void {
    this.records.push({ level: 'info', message, meta });
  }

  public error(message: string | object, ...meta: unknown[]): void {
    this.records.push({ level: 'error', message, meta });
  }

  public warn(message: string | object, ...meta: unknown[]): void {
    this.records.push({ level: 'warn', message, meta });
  }

  public debug(message: string | object, ...meta: unknown[]): void {
    this.records.push({ level: 'debug', message, meta });
  }

  public clear(): void {
    this.records = [];
  }
}

export function createMockLogger(): MockLogger {
  return new MockLogger();
}
