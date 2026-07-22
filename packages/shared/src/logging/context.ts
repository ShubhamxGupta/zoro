import { AsyncLocalStorage } from 'async_hooks';
import type { LogContext } from './logger.types.js';

const contextStorage = new AsyncLocalStorage<LogContext>();

export class LogContextManager {
  public static runWithContext<T>(context: LogContext, fn: () => T): T {
    const parentContext = contextStorage.getStore() ?? {};
    const mergedContext = { ...parentContext, ...context };
    return contextStorage.run(mergedContext, fn);
  }

  public static run<T>(context: LogContext, fn: () => T): T {
    return LogContextManager.runWithContext(context, fn);
  }

  public static getContext(): LogContext {
    return contextStorage.getStore() ?? {};
  }

  public static getCorrelationId(): string | undefined {
    return contextStorage.getStore()?.correlationId;
  }
}
