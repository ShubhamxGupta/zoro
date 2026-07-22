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

  private normalizeArgs(
    msgOrMeta: string | Record<string, unknown>,
    metaOrErr?: Record<string, unknown> | Error,
    errParam?: Error,
  ): { message: string; meta?: Record<string, unknown>; error?: Error } {
    if (typeof msgOrMeta === 'string') {
      const error = metaOrErr instanceof Error ? metaOrErr : errParam;
      const meta =
        metaOrErr instanceof Error ? undefined : (metaOrErr as Record<string, unknown> | undefined);
      return { message: msgOrMeta, meta, error };
    }
    const { msg, message, error: metaErr, ...restMeta } = msgOrMeta ?? {};
    const messageStr =
      typeof msg === 'string'
        ? msg
        : typeof message === 'string'
          ? message
          : JSON.stringify(msgOrMeta);
    const errorObj =
      metaOrErr instanceof Error ? metaOrErr : metaErr instanceof Error ? metaErr : errParam;
    return { message: messageStr, meta: restMeta, error: errorObj };
  }

  public fatal(
    msgOrMeta: string | Record<string, unknown>,
    metaOrErr?: Record<string, unknown> | Error,
    error?: Error,
  ): void {
    const { message, meta, error: err } = this.normalizeArgs(msgOrMeta, metaOrErr, error);
    this.emit('fatal', message, meta, err);
  }

  public error(
    msgOrMeta: string | Record<string, unknown>,
    metaOrErr?: Record<string, unknown> | Error,
    error?: Error,
  ): void {
    const { message, meta, error: err } = this.normalizeArgs(msgOrMeta, metaOrErr, error);
    this.emit('error', message, meta, err);
  }

  public warn(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void {
    const { message, meta: resolvedMeta } = this.normalizeArgs(msgOrMeta, meta);
    this.emit('warn', message, resolvedMeta);
  }

  public info(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void {
    const { message, meta: resolvedMeta } = this.normalizeArgs(msgOrMeta, meta);
    this.emit('info', message, resolvedMeta);
  }

  public debug(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void {
    const { message, meta: resolvedMeta } = this.normalizeArgs(msgOrMeta, meta);
    this.emit('debug', message, resolvedMeta);
  }

  public trace(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void {
    const { message, meta: resolvedMeta } = this.normalizeArgs(msgOrMeta, meta);
    this.emit('trace', message, resolvedMeta);
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
