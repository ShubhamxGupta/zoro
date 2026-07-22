import type { ILogger, LogContext, LogLevel, LoggerOptions, LogRecord } from './logger.types.js';
import { LOG_LEVEL_SEVERITY } from './logger.types.js';
import { LogContextManager } from './context.js';
import { redactValue } from './redactor.js';

export class Logger implements ILogger {
  private readonly serviceName: string;
  private readonly minLevel: LogLevel;
  private readonly enableRedaction: boolean;
  private readonly boundContext: LogContext;
  private readonly destination: (jsonString: string) => void;

  constructor(options: LoggerOptions = {}, boundContext: LogContext = {}) {
    this.serviceName = options.serviceName ?? 'repo-intel-service';
    this.minLevel = options.minLevel ?? 'info';
    this.enableRedaction = options.enableRedaction ?? true;
    this.boundContext = boundContext;
    this.destination =
      options.destination ??
      ((jsonString: string) => {
        process.stdout.write(jsonString + '\n');
      });
  }

  private shouldLog(level: LogLevel): boolean {
    const targetSeverity = LOG_LEVEL_SEVERITY[level];
    const minSeverity = LOG_LEVEL_SEVERITY[this.minLevel];
    return targetSeverity >= minSeverity;
  }

  private emit(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const asyncContext = LogContextManager.getContext();
    const combinedContext = {
      ...asyncContext,
      ...this.boundContext,
      ...(meta ?? {}),
    };

    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
    };

    if (Object.keys(combinedContext).length > 0) {
      record.context = this.enableRedaction
        ? (redactValue(combinedContext) as LogContext)
        : combinedContext;
    }

    if (error) {
      record.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const formattedPayload = this.enableRedaction ? redactValue(record) : record;
    this.destination(JSON.stringify(formattedPayload));
  }

  public fatal(message: string, meta?: Record<string, unknown>, error?: Error): void {
    this.emit('fatal', message, meta, error);
  }

  public error(message: string, meta?: Record<string, unknown>, error?: Error): void {
    this.emit('error', message, meta, error);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.emit('warn', message, meta);
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.emit('info', message, meta);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.emit('debug', message, meta);
  }

  public trace(message: string, meta?: Record<string, unknown>): void {
    this.emit('trace', message, meta);
  }

  public child(bindings: LogContext): ILogger {
    const mergedBindings = { ...this.boundContext, ...bindings };
    return new Logger(
      {
        serviceName: this.serviceName,
        minLevel: this.minLevel,
        enableRedaction: this.enableRedaction,
        destination: this.destination,
      },
      mergedBindings,
    );
  }
}

export function createLogger(options?: LoggerOptions): ILogger {
  return new Logger(options);
}
