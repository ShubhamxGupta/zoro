import dotenv from 'dotenv';
import { EnvSchema, type AppConfig } from './env.schema.js';

export class ConfigValidationError extends Error {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message);
    this.name = 'ConfigValidationError';
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

let cachedConfig: Readonly<AppConfig> | null = null;

export interface LoadConfigOptions {
  envFilePath?: string;
  overrideEnv?: Record<string, string | undefined>;
  reload?: boolean;
}

export function loadConfig(options: LoadConfigOptions = {}): Readonly<AppConfig> {
  if (cachedConfig && !options.reload) {
    return cachedConfig;
  }

  if (options.envFilePath) {
    dotenv.config({ path: options.envFilePath });
  } else {
    dotenv.config();
  }

  const rawEnv = options.overrideEnv ?? process.env;
  const result = EnvSchema.safeParse(rawEnv);

  if (!result.success) {
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'root';
      if (!formattedErrors[path]) {
        formattedErrors[path] = [];
      }
      formattedErrors[path].push(issue.message);
    }

    throw new ConfigValidationError(
      `Invalid environment configuration: ${Object.keys(formattedErrors).join(', ')}`,
      formattedErrors,
    );
  }

  const config: Readonly<AppConfig> = Object.freeze(result.data);
  cachedConfig = config;
  return config;
}

export function getConfig(): Readonly<AppConfig> {
  const current = cachedConfig;
  if (current !== null) {
    return current;
  }
  return loadConfig();
}

export function resetConfigForTesting(): void {
  cachedConfig = null;
}
