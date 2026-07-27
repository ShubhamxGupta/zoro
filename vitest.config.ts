import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@repo-intel/parser': new URL('./packages/parser/src/index.ts', import.meta.url).pathname,
      '@repo-intel/shared': new URL('./packages/shared/src/index.ts', import.meta.url).pathname,
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
