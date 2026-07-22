import type { LogContext } from './logger.types.js';
export declare class LogContextManager {
    static runWithContext<T>(context: LogContext, fn: () => T): T;
    static run<T>(context: LogContext, fn: () => T): T;
    static getContext(): LogContext;
    static getCorrelationId(): string | undefined;
}
//# sourceMappingURL=context.d.ts.map