/**
 * Structured Logging & Telemetry Types
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
export declare const LOG_LEVEL_SEVERITY: Record<LogLevel, number>;
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
    fatal(msgOrMeta: string | Record<string, unknown>, metaOrErr?: Record<string, unknown> | Error, error?: Error): void;
    error(msgOrMeta: string | Record<string, unknown>, metaOrErr?: Record<string, unknown> | Error, error?: Error): void;
    warn(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void;
    info(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void;
    debug(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void;
    trace(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void;
    child(bindings: LogContext): ILogger;
}
//# sourceMappingURL=logger.types.d.ts.map