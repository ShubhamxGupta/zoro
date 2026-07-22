import { type AppConfig } from './env.schema.js';
export declare class ConfigValidationError extends Error {
    readonly errors: Record<string, string[]>;
    constructor(message: string, errors: Record<string, string[]>);
}
export interface LoadConfigOptions {
    envFilePath?: string;
    overrideEnv?: Record<string, string | undefined>;
    reload?: boolean;
}
export declare function loadConfig(options?: LoadConfigOptions): Readonly<AppConfig>;
export declare function getConfig(): Readonly<AppConfig>;
export declare function resetConfigForTesting(): void;
//# sourceMappingURL=config.loader.d.ts.map