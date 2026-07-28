import { describe, expect, it } from 'vitest';
import { BenchmarkRunner } from './benchmark-runner.js';

describe('BenchmarkRunner Suite', () => {
  it('executes 100k LOC indexing benchmark under 45s threshold', async () => {
    const runner = new BenchmarkRunner(100000, 45000, 512);
    const result = await runner.runIndexingBenchmark();

    expect(result.locIndexed).toBeGreaterThanOrEqual(99000);
    expect(result.fileCount).toBeGreaterThan(500);
    expect(result.durationMs).toBeLessThan(45000);
    expect(result.status).toBe('PASSED');
  });
});
