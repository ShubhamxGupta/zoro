import { createLogger } from './logger.js';
import { LogContextManager } from './context.js';

export * from './logger.types.js';
export { redactString, redactValue } from './redactor.js';
export { LogContextManager } from './context.js';
export { Logger, createLogger } from './logger.js';

export const logger = createLogger();
export const logContext = LogContextManager;
