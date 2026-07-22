import type { ILogger, LogContext, LoggerOptions } from './logger.types.js';
export declare class Logger implements ILogger {
    private readonly serviceName;
    private readonly minLevel;
    private readonly enableRedaction;
    private readonly boundContext;
    private readonly destination;
    constructor(options?: LoggerOptions, boundContext?: LogContext);
    private shouldLog;
    private emit;
    private normalizeArgs;
    fatal(msgOrMeta: string | Record<string, unknown>, metaOrErr?: Record<string, unknown> | Error, error?: Error): void;
    error(msgOrMeta: string | Record<string, unknown>, metaOrErr?: Record<string, unknown> | Error, error?: Error): void;
    warn(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void;
    info(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void;
    debug(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void;
    trace(msgOrMeta: string | Record<string, unknown>, meta?: Record<string, unknown>): void;
    child(bindings: LogContext): ILogger;
}
export declare function createLogger(options?: LoggerOptions): ILogger;
//# sourceMappingURL=logger.d.ts.map