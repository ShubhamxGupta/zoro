import { LOG_LEVEL_SEVERITY } from './logger.types.js';
import { LogContextManager } from './context.js';
import { redactValue } from './redactor.js';
export class Logger {
    serviceName;
    minLevel;
    enableRedaction;
    boundContext;
    destination;
    constructor(options = {}, boundContext = {}) {
        this.serviceName = options.serviceName ?? 'repo-intel-service';
        this.minLevel = options.minLevel ?? 'info';
        this.enableRedaction = options.enableRedaction ?? true;
        this.boundContext = boundContext;
        this.destination =
            options.destination ??
                ((jsonString) => {
                    process.stdout.write(jsonString + '\n');
                });
    }
    shouldLog(level) {
        const targetSeverity = LOG_LEVEL_SEVERITY[level];
        const minSeverity = LOG_LEVEL_SEVERITY[this.minLevel];
        return targetSeverity >= minSeverity;
    }
    emit(level, message, meta, error) {
        if (!this.shouldLog(level)) {
            return;
        }
        const asyncContext = LogContextManager.getContext();
        const combinedContext = {
            ...asyncContext,
            ...this.boundContext,
            ...(meta ?? {}),
        };
        const record = {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: this.serviceName,
        };
        if (Object.keys(combinedContext).length > 0) {
            record.context = this.enableRedaction
                ? redactValue(combinedContext)
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
    normalizeArgs(msgOrMeta, metaOrErr, errParam) {
        if (typeof msgOrMeta === 'string') {
            const error = metaOrErr instanceof Error ? metaOrErr : errParam;
            const meta = metaOrErr instanceof Error ? undefined : metaOrErr;
            return { message: msgOrMeta, meta, error };
        }
        const { msg, message, error: metaErr, ...restMeta } = msgOrMeta ?? {};
        const messageStr = typeof msg === 'string'
            ? msg
            : typeof message === 'string'
                ? message
                : JSON.stringify(msgOrMeta);
        const errorObj = metaOrErr instanceof Error ? metaOrErr : metaErr instanceof Error ? metaErr : errParam;
        return { message: messageStr, meta: restMeta, error: errorObj };
    }
    fatal(msgOrMeta, metaOrErr, error) {
        const { message, meta, error: err } = this.normalizeArgs(msgOrMeta, metaOrErr, error);
        this.emit('fatal', message, meta, err);
    }
    error(msgOrMeta, metaOrErr, error) {
        const { message, meta, error: err } = this.normalizeArgs(msgOrMeta, metaOrErr, error);
        this.emit('error', message, meta, err);
    }
    warn(msgOrMeta, meta) {
        const { message, meta: resolvedMeta } = this.normalizeArgs(msgOrMeta, meta);
        this.emit('warn', message, resolvedMeta);
    }
    info(msgOrMeta, meta) {
        const { message, meta: resolvedMeta } = this.normalizeArgs(msgOrMeta, meta);
        this.emit('info', message, resolvedMeta);
    }
    debug(msgOrMeta, meta) {
        const { message, meta: resolvedMeta } = this.normalizeArgs(msgOrMeta, meta);
        this.emit('debug', message, resolvedMeta);
    }
    trace(msgOrMeta, meta) {
        const { message, meta: resolvedMeta } = this.normalizeArgs(msgOrMeta, meta);
        this.emit('trace', message, resolvedMeta);
    }
    child(bindings) {
        const mergedBindings = { ...this.boundContext, ...bindings };
        return new Logger({
            serviceName: this.serviceName,
            minLevel: this.minLevel,
            enableRedaction: this.enableRedaction,
            destination: this.destination,
        }, mergedBindings);
    }
}
export function createLogger(options) {
    return new Logger(options);
}
//# sourceMappingURL=logger.js.map