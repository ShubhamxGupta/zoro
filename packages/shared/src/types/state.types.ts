import type { LanguageId, FileCategory } from './language.types.js';
import type { RepositoryFacts } from './facts.types.js';

export interface StateFileRecord {
  relativePath: string;
  sizeInBytes: number;
  mtimeMs: number;
  sha256?: string;
  languageId: LanguageId;
  category: FileCategory;
  isBinary: boolean;
}

export interface ScanStatistics {
  totalFiles: number;
  sourceFiles: number;
  testFiles: number;
  configFiles: number;
  binaryFiles: number;
  ignoredFiles: number;
  totalDirectories: number;
  totalSizeBytes: number;
  scanDurationMs: number;
  hashOperations: number;
}

export interface RepositoryState {
  version: number; // Schema version (e.g. 1)
  repositoryId: string;
  rootPath: string;
  lastScanTimestamp: string;
  scannerVersion: string;
  files: Record<string, StateFileRecord>;
  statistics: ScanStatistics;
}

export interface DeltaResult {
  added: StateFileRecord[];
  modified: StateFileRecord[];
  deleted: string[]; // Relative paths
  unchanged: StateFileRecord[];
  renamed: Array<{ oldPath: string; newPath: string }>;
  moved: Array<{ oldPath: string; newPath: string }>;
  permissionChanged: StateFileRecord[];
  metadataChanged: StateFileRecord[];
  hasChanges: boolean;
}

export interface RepositorySnapshot {
  state: RepositoryState;
  facts: RepositoryFacts;
  delta: DeltaResult;
  statistics: ScanStatistics;
}
