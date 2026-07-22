import {
  loadConfig,
  getConfig,
  resetConfigForTesting,
  ConfigValidationError,
} from './config.loader.js';

export function runConfigTests(): void {
  // Test 1: Load default configuration
  resetConfigForTesting();
  const config = loadConfig({
    overrideEnv: {
      NODE_ENV: 'development',
      PORT: '3000',
      LOG_LEVEL: 'info',
    },
    reload: true,
  });

  if (config.NODE_ENV !== 'development') {
    throw new Error(`Expected NODE_ENV to be development, got ${config.NODE_ENV}`);
  }
  if (config.PORT !== 3000) {
    throw new Error(`Expected PORT to be 3000, got ${config.PORT}`);
  }
  if (config.LOG_LEVEL !== 'info') {
    throw new Error(`Expected LOG_LEVEL to be info, got ${config.LOG_LEVEL}`);
  }
  if (config.KUZU_DB_PATH !== './.kuzu') {
    throw new Error(`Expected default KUZU_DB_PATH, got ${config.KUZU_DB_PATH}`);
  }

  // Test 2: Verify singleton / cached instance
  const fetchedConfig = getConfig();
  if (fetchedConfig !== config) {
    throw new Error('getConfig() did not return cached config instance');
  }

  // Test 3: Validation Error on Invalid Port Number
  resetConfigForTesting();
  try {
    loadConfig({
      overrideEnv: {
        PORT: 'invalid_port',
      },
      reload: true,
    });
    throw new Error('Expected ConfigValidationError for invalid port');
  } catch (err) {
    if (!(err instanceof ConfigValidationError)) {
      throw new Error(`Expected ConfigValidationError, got ${err}`);
    }
  }

  // Test 4: Validation Error on Invalid Enum
  resetConfigForTesting();
  try {
    loadConfig({
      overrideEnv: {
        LOG_LEVEL: 'invalid_log_level',
      },
      reload: true,
    });
    throw new Error('Expected ConfigValidationError for invalid log level');
  } catch (err) {
    if (!(err instanceof ConfigValidationError)) {
      throw new Error(`Expected ConfigValidationError, got ${err}`);
    }
  }

  console.info('All Phase 02 Configuration Unit Tests Passed Cleanly!');
}
