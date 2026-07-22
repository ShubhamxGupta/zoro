import { Logger, createLogger } from './logger.js';
import { LogContextManager } from './context.js';
import { redactString, redactValue } from './redactor.js';
import type { LogRecord } from './logger.types.js';

export function runLoggingTests(): void {
  const emittedRecords: LogRecord[] = [];
  const testDestination = (jsonString: string) => {
    emittedRecords.push(JSON.parse(jsonString));
  };

  // Test 1: Basic structured JSON emission using createLogger
  const logger = createLogger({
    serviceName: 'test-service',
    minLevel: 'info',
    enableRedaction: true,
    destination: testDestination,
  });

  logger.info('System initialization complete', { port: 3000 });

  if (emittedRecords.length === 0) {
    throw new Error('Expected record to be emitted');
  }

  const firstRecord = emittedRecords[0]!;
  if (firstRecord.level !== 'info') {
    throw new Error(`Expected log level 'info', got ${firstRecord.level}`);
  }
  if (firstRecord.service !== 'test-service') {
    throw new Error(`Expected service 'test-service', got ${firstRecord.service}`);
  }
  if (firstRecord.message !== 'System initialization complete') {
    throw new Error(
      `Expected message 'System initialization complete', got ${firstRecord.message}`,
    );
  }

  // Test 2: Min level filtering
  const countBeforeDebug = emittedRecords.length;
  logger.debug('This debug log should be suppressed');
  if (emittedRecords.length !== countBeforeDebug) {
    throw new Error('Debug log was not suppressed when minLevel is info');
  }

  // Test 3: Correlation context propagation
  LogContextManager.runWithContext({ correlationId: 'corr-12345' }, () => {
    logger.warn('Resource usage high', { cpu: '85%' });
  });

  const secondRecord = emittedRecords[emittedRecords.length - 1]!;
  if (secondRecord.context?.correlationId !== 'corr-12345') {
    throw new Error(
      `Expected correlationId 'corr-12345', got ${secondRecord.context?.correlationId}`,
    );
  }

  // Test 4: Secret & API Key Redaction
  logger.error('API call failed', {
    apiKey: 'sk-1234567890abcdef1234567890abcdef',
    password: 'SuperSecretPassword123!',
    authorization: 'Bearer secret_token_value',
  });

  const thirdRecord = emittedRecords[emittedRecords.length - 1]!;
  const context = thirdRecord.context as Record<string, unknown>;

  if (context.apiKey !== '[REDACTED]') {
    throw new Error(`Expected apiKey to be '[REDACTED]', got ${context.apiKey}`);
  }
  if (context.password !== '[REDACTED]') {
    throw new Error(`Expected password to be '[REDACTED]', got ${context.password}`);
  }
  if (context.authorization !== '[REDACTED]') {
    throw new Error(`Expected authorization to be '[REDACTED]', got ${context.authorization}`);
  }

  // Test 5: String pattern redaction
  const sanitizedString = redactString(
    'Failed to authenticate with key sk-1234567890abcdef1234567890abcdef',
  );
  if (sanitizedString.includes('sk-1234567890abcdef1234567890abcdef')) {
    throw new Error('redactString failed to redact OpenAI key pattern');
  }

  // Test 6: RedactValue utility on nested object
  const redactedObject = redactValue({ token: 'xyz123', safe: 'hello' }) as Record<string, string>;
  if (redactedObject.token !== '[REDACTED]' || redactedObject.safe !== 'hello') {
    throw new Error('redactValue object masking failed');
  }

  // Test 7: Child logger binding
  const baseLogger = new Logger({
    serviceName: 'parent-service',
    destination: testDestination,
  });
  const childLogger = baseLogger.child({ tenantId: 'tenant-999' });
  childLogger.info('Child log execution');

  const fourthRecord = emittedRecords[emittedRecords.length - 1]!;
  if (fourthRecord.context?.tenantId !== 'tenant-999') {
    throw new Error(`Expected child tenantId 'tenant-999', got ${fourthRecord.context?.tenantId}`);
  }

  console.info('All Phase 03 Logging & Telemetry Unit Tests Passed Cleanly!');
}
