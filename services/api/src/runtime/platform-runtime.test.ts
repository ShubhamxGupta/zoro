import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DefaultPlatformRuntime } from './platform-runtime.js';

describe('DefaultPlatformRuntime', () => {
  let runtime: DefaultPlatformRuntime;

  beforeEach(async () => {
    runtime = new DefaultPlatformRuntime();
    await runtime.initialize();
  });

  afterEach(async () => {
    await runtime.shutdown();
  });

  it('manages platform lifecycle, health, and command execution', async () => {
    const health = await runtime.health();
    expect(health.status).toBe('healthy');

    const result = await runtime.execute<{ indexedFiles: number }>('indexRepository', {
      repoPath: '.',
    });
    expect(result.indexedFiles).toBe(25);
  });
});
