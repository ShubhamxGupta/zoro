import dotenv from 'dotenv';
import { EnvSchema } from './env.schema.js';
export class ConfigValidationError extends Error {
    errors;
    constructor(message, errors) {
        super(message);
        this.name = 'ConfigValidationError';
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
let cachedConfig = null;
export function loadConfig(options = {}) {
    if (cachedConfig && !options.reload) {
        return cachedConfig;
    }
    if (options.envFilePath) {
        dotenv.config({ path: options.envFilePath });
    }
    else {
        dotenv.config();
    }
    const rawEnv = options.overrideEnv ?? process.env;
    const result = EnvSchema.safeParse(rawEnv);
    if (!result.success) {
        const formattedErrors = {};
        for (const issue of result.error.issues) {
            const path = issue.path.join('.') || 'root';
            if (!formattedErrors[path]) {
                formattedErrors[path] = [];
            }
            formattedErrors[path].push(issue.message);
        }
        throw new ConfigValidationError(`Invalid environment configuration: ${Object.keys(formattedErrors).join(', ')}`, formattedErrors);
    }
    const config = Object.freeze(result.data);
    cachedConfig = config;
    return config;
}
export function getConfig() {
    const current = cachedConfig;
    if (current !== null) {
        return current;
    }
    return loadConfig();
}
export function resetConfigForTesting() {
    cachedConfig = null;
}
//# sourceMappingURL=config.loader.js.map