import { describe, bench } from 'vitest';
import path from 'node:path';
import { IncrementalIndexer } from './incremental-indexer.js';

describe('Incremental Repository Indexer Benchmark', () => {
  const indexer = new IncrementalIndexer();
  const rootPath = path.resolve(process.cwd());

  bench('cold initial repository scan (forceFullScan)', async () => {
    await indexer.scanRepository(rootPath, { forceFullScan: true });
  });

  bench('warm incremental repository scan (cached state)', async () => {
    await indexer.scanRepository(rootPath, { forceFullScan: false });
  });
});
