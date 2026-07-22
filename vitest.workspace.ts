import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'packages',
      include: ['packages/**/*.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'services',
      include: ['services/**/*.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
    },
  },
]);
