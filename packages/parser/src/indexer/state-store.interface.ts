import type { RepositoryState } from '@repo-intel/shared';

export interface RepositoryStateStore {
  load(rootPath: string): Promise<RepositoryState | null>;
  save(rootPath: string, state: RepositoryState): Promise<void>;
  clear(rootPath: string): Promise<void>;
}
