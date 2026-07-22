import fs from 'node:fs/promises';
import path from 'node:path';
import type { RepositoryState } from '@repo-intel/shared';
import type { RepositoryStateStore } from './state-store.interface.js';

export const CACHE_FILE_NAME = '.repo-intel-cache.json';

export class JsonRepositoryStateStore implements RepositoryStateStore {
  public async load(rootPath: string): Promise<RepositoryState | null> {
    const cachePath = path.join(rootPath, CACHE_FILE_NAME);
    try {
      const content = await fs.readFile(cachePath, 'utf-8');
      const state = JSON.parse(content) as RepositoryState;
      if (!state.version || state.version !== 1) {
        return null; // Incompatible cache version fallback
      }
      return state;
    } catch {
      return null;
    }
  }

  public async save(rootPath: string, state: RepositoryState): Promise<void> {
    const cachePath = path.join(rootPath, CACHE_FILE_NAME);
    const tempPath = `${cachePath}.tmp-${Date.now()}`;
    const payload = JSON.stringify(state, null, 2);

    try {
      await fs.writeFile(tempPath, payload, 'utf-8');
      await fs.rename(tempPath, cachePath); // Atomic swap
    } catch {
      try {
        await fs.unlink(tempPath);
      } catch {
        // Cleanup temp file if rename failed
      }
    }
  }

  public async clear(rootPath: string): Promise<void> {
    const cachePath = path.join(rootPath, CACHE_FILE_NAME);
    try {
      await fs.unlink(cachePath);
    } catch {
      // Already absent
    }
  }
}
