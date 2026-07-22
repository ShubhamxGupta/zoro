import type { StateFileRecord, RepositorySnapshot } from '@repo-intel/shared';

export type ScannerEventType =
  | 'RepositoryOpened'
  | 'RepositoryScanned'
  | 'FileAdded'
  | 'FileModified'
  | 'FileDeleted'
  | 'FileIgnored'
  | 'ScanCompleted'
  | 'ScanCancelled';

export interface ScannerEventPayloads {
  RepositoryOpened: { rootPath: string };
  RepositoryScanned: { rootPath: string; fileCount: number };
  FileAdded: { file: StateFileRecord };
  FileModified: { file: StateFileRecord };
  FileDeleted: { relativePath: string };
  FileIgnored: { relativePath: string };
  ScanCompleted: { snapshot: RepositorySnapshot };
  ScanCancelled: { rootPath: string };
}

export type ScannerEventListener<K extends ScannerEventType> = (
  payload: ScannerEventPayloads[K],
) => void;

export class ScannerEventEmitter {
  private listeners: { [K in ScannerEventType]?: Set<ScannerEventListener<K>> } = {};

  public on<K extends ScannerEventType>(event: K, listener: ScannerEventListener<K>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as unknown as undefined;
    }
    (this.listeners[event] as Set<ScannerEventListener<K>>).add(listener);
  }

  public off<K extends ScannerEventType>(event: K, listener: ScannerEventListener<K>): void {
    (this.listeners[event] as Set<ScannerEventListener<K>> | undefined)?.delete(listener);
  }

  public emit<K extends ScannerEventType>(event: K, payload: ScannerEventPayloads[K]): void {
    const set = this.listeners[event] as Set<ScannerEventListener<K>> | undefined;
    if (set) {
      for (const listener of set) {
        try {
          listener(payload);
        } catch {
          // Prevent subscriber errors from crashing scanner loop
        }
      }
    }
  }
}
