import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { IncrementalIndexer } from './incremental-indexer.js';
import { JsonRepositoryStateStore, CACHE_FILE_NAME } from './json-state-store.js';

describe('Repository State Store & Incremental Indexer Suite', () => {
  let tempDir: string;
  let indexer: IncrementalIndexer;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zoro-indexer-test-'));
    await fs.mkdir(path.join(tempDir, 'src'), { recursive: true });

    await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify({ name: 'test-app', dependencies: { next: '^14.0.0', react: '^18.0.0' } }));
    await fs.writeFile(path.join(tempDir, 'src', 'index.ts'), 'export const hello = "world";');
    await fs.writeFile(path.join(tempDir, 'src', 'util.ts'), 'export const add = (a: number, b: number) => a + b;');

    indexer = new IncrementalIndexer();
  });

  afterAll(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Cleanup
    }
  });

  test('First cold scan calculates deltas and persists state cache store', async () => {
    const eventsTriggered: string[] = [];
    indexer.events.on('RepositoryOpened', () => eventsTriggered.push('RepositoryOpened'));
    indexer.events.on('ScanCompleted', () => eventsTriggered.push('ScanCompleted'));

    const snapshot = await indexer.scanRepository(tempDir);

    expect(snapshot.delta.added.length).toBeGreaterThan(0);
    expect(snapshot.delta.hasChanges).toBe(true);
    expect(snapshot.facts.primaryLanguage).toBe('typescript');
    expect(snapshot.facts.frameworks.map((f: { name: string }) => f.name)).toContain('next');
    expect(eventsTriggered).toContain('RepositoryOpened');
    expect(eventsTriggered).toContain('ScanCompleted');

    // Verify .repo-intel-cache.json creation
    const cacheExists = await fs.stat(path.join(tempDir, CACHE_FILE_NAME));
    expect(cacheExists.isFile()).toBe(true);
  });

  test('Subsequent warm scan uses metadata hash short-circuit optimization', async () => {
    const snapshot = await indexer.scanRepository(tempDir);

    expect(snapshot.delta.added.length).toBe(0);
    expect(snapshot.delta.modified.length).toBe(0);
    expect(snapshot.delta.unchanged.length).toBeGreaterThan(0);
    expect(snapshot.delta.hasChanges).toBe(false);
    expect(snapshot.statistics.hashOperations).toBe(0); // 0 hash calls on unchanged files!
  });

  test('Detects file modification when mtime and content change', async () => {
    const utilPath = path.join(tempDir, 'src', 'util.ts');
    await fs.writeFile(utilPath, 'export const add = (a: number, b: number) => a + b + 1;');

    const snapshot = await indexer.scanRepository(tempDir);

    expect(snapshot.delta.modified.length).toBe(1);
    expect(snapshot.delta.modified[0]?.relativePath).toBe('src/util.ts');
    expect(snapshot.delta.hasChanges).toBe(true);
  });

  test('Detects file deletion when a file is removed', async () => {
    const utilPath = path.join(tempDir, 'src', 'util.ts');
    await fs.unlink(utilPath);

    const snapshot = await indexer.scanRepository(tempDir);

    expect(snapshot.delta.deleted).toContain('src/util.ts');
    expect(snapshot.delta.hasChanges).toBe(true);
  });

  test('JsonRepositoryStateStore handles load, save, and clear operations', async () => {
    const store = new JsonRepositoryStateStore();
    const state = await store.load(tempDir);

    expect(state).not.toBeNull();
    expect(state?.version).toBe(1);

    await store.clear(tempDir);
    const cleared = await store.load(tempDir);
    expect(cleared).toBeNull();
  });
});
