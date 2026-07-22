import { describe, test, expect } from 'vitest';
import { Logger, createLogger } from './logger.js';
import { LogContextManager } from './context.js';
import { redactString, redactValue } from './redactor.js';
import type { LogRecord } from './logger.types.js';

describe('Structured Logger & Diagnostics Suite', () => {
  test('emits structured JSON records with service context', () => {
    const emittedRecords: LogRecord[] = [];
    const logger = createLogger({
      serviceName: 'test-service',
      minLevel: 'info',
      enableRedaction: true,
      destination: (jsonString) => emittedRecords.push(JSON.parse(jsonString)),
    });

    logger.info('System initialization complete', { port: 3000 });

    expect(emittedRecords).toHaveLength(1);
    const rec = emittedRecords[0];
    expect(rec).toBeDefined();
    if (rec) {
      expect(rec.level).toBe('info');
      expect(rec.service).toBe('test-service');
      expect(rec.message).toBe('System initialization complete');
    }
  });

  test('suppresses logs below minLevel', () => {
    const emittedRecords: LogRecord[] = [];
    const logger = createLogger({
      serviceName: 'test-service',
      minLevel: 'info',
      destination: (jsonString) => emittedRecords.push(JSON.parse(jsonString)),
    });

    logger.debug('This debug log should be suppressed');
    expect(emittedRecords).toHaveLength(0);
  });

  test('propagates correlation context via AsyncLocalStorage', () => {
    const emittedRecords: LogRecord[] = [];
    const logger = createLogger({
      serviceName: 'test-service',
      destination: (jsonString) => emittedRecords.push(JSON.parse(jsonString)),
    });

    LogContextManager.runWithContext({ correlationId: 'corr-12345' }, () => {
      logger.warn('Resource usage high', { cpu: '85%' });
    });

    expect(emittedRecords).toHaveLength(1);
    const rec = emittedRecords[0];
    expect(rec).toBeDefined();
    if (rec) {
      expect(rec.context?.correlationId).toBe('corr-12345');
    }
  });

  test('redacts sensitive API keys and secrets in metadata and text', () => {
    const emittedRecords: LogRecord[] = [];
    const logger = createLogger({
      serviceName: 'test-service',
      enableRedaction: true,
      destination: (jsonString) => emittedRecords.push(JSON.parse(jsonString)),
    });

    logger.error('API call failed', {
      apiKey: 'sk-1234567890abcdef1234567890abcdef',
      password: 'SuperSecretPassword123!',
      authorization: 'Bearer secret_token_value',
    });

    expect(emittedRecords).toHaveLength(1);
    const rec = emittedRecords[0];
    expect(rec).toBeDefined();
    if (rec) {
      const context = rec.context as Record<string, unknown>;
      expect(context.apiKey).toBe('[REDACTED]');
      expect(context.password).toBe('[REDACTED]');
      expect(context.authorization).toBe('[REDACTED]');
    }

    const redactedText = redactString('Failed with key sk-1234567890abcdef1234567890abcdef');
    expect(redactedText).not.toContain('sk-1234567890abcdef1234567890abcdef');

    const redactedObject = redactValue({ token: 'xyz123', safe: 'hello' }) as Record<string, string>;
    expect(redactedObject.token).toBe('[REDACTED]');
    expect(redactedObject.safe).toBe('hello');
  });

  test('binds contextual attributes to child logger instances', () => {
    const emittedRecords: LogRecord[] = [];
    const baseLogger = new Logger({
      serviceName: 'parent-service',
      destination: (jsonString) => emittedRecords.push(JSON.parse(jsonString)),
    });

    const childLogger = baseLogger.child({ tenantId: 'tenant-999' });
    childLogger.info('Child log execution');

    expect(emittedRecords).toHaveLength(1);
    const rec = emittedRecords[0];
    expect(rec).toBeDefined();
    if (rec) {
      expect(rec.context?.tenantId).toBe('tenant-999');
    }
  });
});
