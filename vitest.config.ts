import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@repo-intel/shared': new URL('./packages/shared/src/index.ts', import.meta.url).pathname,
      '@repo-intel/parser': new URL('./packages/parser/src/index.ts', import.meta.url).pathname,
      '@repo-intel/graph': new URL('./packages/graph/src/index.ts', import.meta.url).pathname,
      '@repo-intel/retrieval': new URL('./packages/retrieval/src/index.ts', import.meta.url).pathname,
      '@repo-intel/ai': new URL('./packages/ai/src/index.ts', import.meta.url).pathname,
      '@repo-intel/review-engine': new URL('./packages/review-engine/src/index.ts', import.meta.url).pathname,
      '@repo-intel/patch-gen': new URL('./packages/patch-gen/src/index.ts', import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'packages/shared/src/**/*.ts',
        'packages/testing/src/**/*.ts',
        'services/api/src/**/*.ts',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/e2e/**',
        '**/*.test.ts',
        '**/*.d.ts',
        '**/*.types.ts',
        '**/index.ts',
        '**/*.bench.ts',
      ],
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 20,
        statements: 20,
      },
    },
  },
});
