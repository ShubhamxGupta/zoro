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
    include: ['services/api/src/e2e/**/*.test.ts'],
    testTimeout: 30000,
  },
});
