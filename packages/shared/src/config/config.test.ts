import { describe, test, expect, beforeEach } from 'vitest';
import { loadConfig, getConfig, resetConfigForTesting, ConfigValidationError } from './config.loader.js';

describe('Configuration Engine Unit Tests', () => {
  beforeEach(() => {
    resetConfigForTesting();
  });

  test('loads default development configuration correctly', () => {
    const config = loadConfig({
      overrideEnv: {
        NODE_ENV: 'development',
        PORT: '3000',
        LOG_LEVEL: 'info',
      },
      reload: true,
    });

    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(3000);
    expect(config.LOG_LEVEL).toBe('info');
    expect(config.KUZU_DB_PATH).toBe('./.kuzu');
  });

  test('retrieves singleton cached config instance', () => {
    const loaded = loadConfig({
      overrideEnv: { NODE_ENV: 'test', PORT: '3000' },
      reload: true,
    });
    const cached = getConfig();
    expect(cached).toBe(loaded);
  });

  test('throws ConfigValidationError on invalid port number', () => {
    expect(() =>
      loadConfig({
        overrideEnv: { PORT: 'invalid_port' },
        reload: true,
      }),
    ).toThrow(ConfigValidationError);
  });

  test('throws ConfigValidationError on invalid log level enum', () => {
    expect(() =>
      loadConfig({
        overrideEnv: { LOG_LEVEL: 'invalid_log_level' },
        reload: true,
      }),
    ).toThrow(ConfigValidationError);
  });
});
