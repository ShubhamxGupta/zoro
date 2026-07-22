export { EnvSchema, type AppConfig } from './env.schema.js';
export { loadConfig, getConfig, ConfigValidationError, resetConfigForTesting, type LoadConfigOptions, } from './config.loader.js';
export declare const config: Readonly<{
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    HOST: string;
    LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
    KUZU_DB_PATH: string;
    LANCE_DB_PATH: string;
    OLLAMA_BASE_URL: string;
    VLLM_BASE_URL: string;
    ENABLE_VECTOR_SEARCH: boolean;
    ENABLE_GRAPH_CACHE: boolean;
    OPENAI_API_KEY?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    GEMINI_API_KEY?: string | undefined;
}>;
//# sourceMappingURL=index.d.ts.map