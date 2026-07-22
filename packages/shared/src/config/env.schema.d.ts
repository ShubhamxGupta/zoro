import { z } from 'zod';
export declare const EnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    HOST: z.ZodDefault<z.ZodString>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["fatal", "error", "warn", "info", "debug", "trace"]>>;
    KUZU_DB_PATH: z.ZodDefault<z.ZodString>;
    LANCE_DB_PATH: z.ZodDefault<z.ZodString>;
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
    GEMINI_API_KEY: z.ZodOptional<z.ZodString>;
    OLLAMA_BASE_URL: z.ZodDefault<z.ZodString>;
    VLLM_BASE_URL: z.ZodDefault<z.ZodString>;
    ENABLE_VECTOR_SEARCH: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
    ENABLE_GRAPH_CACHE: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
}, "strip", z.ZodTypeAny, {
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
}, {
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: string | undefined;
    HOST?: string | undefined;
    LOG_LEVEL?: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | undefined;
    KUZU_DB_PATH?: string | undefined;
    LANCE_DB_PATH?: string | undefined;
    OPENAI_API_KEY?: string | undefined;
    ANTHROPIC_API_KEY?: string | undefined;
    GEMINI_API_KEY?: string | undefined;
    OLLAMA_BASE_URL?: string | undefined;
    VLLM_BASE_URL?: string | undefined;
    ENABLE_VECTOR_SEARCH?: string | undefined;
    ENABLE_GRAPH_CACHE?: string | undefined;
}>;
export type AppConfig = ReturnType<typeof EnvSchema.parse>;
//# sourceMappingURL=env.schema.d.ts.map