import { AsyncLocalStorage } from 'async_hooks';
const contextStorage = new AsyncLocalStorage();
export class LogContextManager {
    static runWithContext(context, fn) {
        const parentContext = contextStorage.getStore() ?? {};
        const mergedContext = { ...parentContext, ...context };
        return contextStorage.run(mergedContext, fn);
    }
    static run(context, fn) {
        return LogContextManager.runWithContext(context, fn);
    }
    static getContext() {
        return contextStorage.getStore() ?? {};
    }
    static getCorrelationId() {
        return contextStorage.getStore()?.correlationId;
    }
}
//# sourceMappingURL=context.js.map