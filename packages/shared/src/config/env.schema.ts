import { z } from 'zod';

export const EnvSchema = z.object({
  // Runtime Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server Settings
  PORT: z
    .string()
    .transform((val: string) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535))
    .default('3000'),

  HOST: z.string().default('0.0.0.0'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Database Paths & URIs
  KUZU_DB_PATH: z.string().default('./.kuzu'),
  LANCE_DB_PATH: z.string().default('./.lancedb'),

  // AI Provider Endpoints & Keys
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434'),
  VLLM_BASE_URL: z.string().url().default('http://localhost:8000'),

  // Feature Flags
  ENABLE_VECTOR_SEARCH: z
    .string()
    .transform((val: string) => val.toLowerCase() === 'true')
    .default('true'),

  ENABLE_GRAPH_CACHE: z
    .string()
    .transform((val: string) => val.toLowerCase() === 'true')
    .default('true'),
});

export type AppConfig = ReturnType<typeof EnvSchema.parse>;
