import { describe, bench } from 'vitest';
import { classifyFile } from './classifier.js';
import type { ScannedFile } from '../scanner/scanner.types.js';

describe('Language Classification Benchmark', () => {
  const sampleFile: ScannedFile = {
    relativePath: 'src/services/user.service.test.ts',
    absolutePath: '/d/Coding/zoro/src/services/user.service.test.ts',
    sizeInBytes: 1024,
    mtimeMs: Date.now(),
    isBinary: false,
  };

  bench('classify single TypeScript file', async () => {
    await classifyFile(sampleFile);
  });
});
