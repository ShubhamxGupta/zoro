import type { StateFileRecord, RepositorySnapshot } from '@repo-intel/shared';
import type { ParseDiagnostic } from '@repo-intel/shared';

export type ScannerEventType =
  | 'RepositoryOpened'
  | 'RepositoryScanned'
  | 'RepositoryIndexed'
  | 'FileQueued'
  | 'FileAdded'
  | 'FileModified'
  | 'FileDeleted'
  | 'FileIgnored'
  | 'FileParsingStarted'
  | 'FileParsingCompleted'
  | 'ParseFailed'
  | 'ScanCompleted'
  | 'RepositoryCompleted'
  | 'ScanCancelled';

export interface ScannerEventPayloads {
  RepositoryOpened: { rootPath: string };
  RepositoryScanned: { rootPath: string; fileCount: number };
  RepositoryIndexed: { rootPath: string; totalFiles: number; durationMs: number };
  FileQueued: { relativePath: string };
  FileAdded: { file: StateFileRecord };
  FileModified: { file: StateFileRecord };
  FileDeleted: { relativePath: string };
  FileIgnored: { relativePath: string; reason: string };
  FileParsingStarted: { relativePath: string; languageId: string };
  FileParsingCompleted: { relativePath: string; languageId: string; symbolCount: number; durationMs: number };
  ParseFailed: { relativePath: string; languageId: string; diagnostics: ParseDiagnostic[]; error?: string };
  ScanCompleted: { snapshot: RepositorySnapshot };
  RepositoryCompleted: { snapshot: RepositorySnapshot; totalParseTimeMs: number };
  ScanCancelled: { rootPath: string };
}

export type ScannerEventListener<K extends ScannerEventType> = (
  payload: ScannerEventPayloads[K],
) => void;

export class ScannerEventEmitter {
  private listeners: { [K in ScannerEventType]?: Set<ScannerEventListener<K>> } = {};

  public on<K extends ScannerEventType>(event: K, listener: ScannerEventListener<K>): void {
    if (!this.listeners[event]) {
      (this.listeners[event] as unknown as Set<ScannerEventListener<K>>) = new Set();
    }
    (this.listeners[event] as unknown as Set<ScannerEventListener<K>>).add(listener);
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

  public removeAllListeners(event?: ScannerEventType): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}
