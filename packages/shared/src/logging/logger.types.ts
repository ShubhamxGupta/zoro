/**
 * Structured Logging & Telemetry Types
 */

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

export interface LogContext {
  correlationId?: string;
  requestId?: string;
  serviceName?: string;
  moduleName?: string;
  tenantId?: string;
  repoId?: string;
  [key: string]: unknown;
}

export interface LogRecord {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
  };
  [key: string]: unknown;
}

export interface LoggerOptions {
  serviceName?: string;
  minLevel?: LogLevel;
  enableRedaction?: boolean;
  destination?: (jsonString: string) => void;
}

export interface ILogger {
  fatal(message: string, meta?: Record<string, unknown>, error?: Error): void;
  error(message: string, meta?: Record<string, unknown>, error?: Error): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
  trace(message: string, meta?: Record<string, unknown>): void;
  child(bindings: LogContext): ILogger;
}
