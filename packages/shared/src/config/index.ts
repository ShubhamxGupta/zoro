import { loadConfig } from './config.loader.js';

export { EnvSchema, type AppConfig } from './env.schema.js';
export {
  loadConfig,
  getConfig,
  ConfigValidationError,
  resetConfigForTesting,
  type LoadConfigOptions,
} from './config.loader.js';

export const config = loadConfig();
