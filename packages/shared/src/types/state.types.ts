import type { LanguageId, FileCategory } from './language.types.js';
import type { RepositoryFacts } from './facts.types.js';

export interface StateFileRecord {
  readonly relativePath: string;
  readonly sizeInBytes: number;
  readonly mtimeMs: number;
  readonly sha256?: string;
  readonly languageId: LanguageId;
  readonly category: FileCategory;
  readonly isBinary: boolean;
}

export interface ScanStatistics {
  readonly totalFiles: number;
  readonly sourceFiles: number;
  readonly testFiles: number;
  readonly configFiles: number;
  readonly binaryFiles: number;
  readonly ignoredFiles: number;
  readonly totalDirectories: number;
  readonly totalSizeBytes: number;
  readonly scanDurationMs: number;
  readonly hashOperations: number;
}

export interface DeltaSummaryStatistics {
  readonly addedCount: number;
  readonly modifiedCount: number;
  readonly deletedCount: number;
  readonly unchangedCount: number;
  readonly renamedCount: number;
  readonly totalChangedFiles: number;
}

export interface RepositoryState {
  readonly version: number; // Schema version (e.g. 1)
  readonly repositoryId: string;
  readonly rootPath: string;
  readonly lastScanTimestamp: string;
  readonly scannerVersion: string;
  readonly files: Readonly<Record<string, StateFileRecord>>;
  readonly statistics: ScanStatistics;
}

export interface DeltaResult {
  readonly added: readonly StateFileRecord[];
  readonly modified: readonly StateFileRecord[];
  readonly deleted: readonly string[];
  readonly unchanged: readonly StateFileRecord[];
  readonly renamed: ReadonlyArray<{ oldPath: string; newPath: string }>;
  readonly moved: ReadonlyArray<{ oldPath: string; newPath: string }>;
  readonly permissionChanged: readonly StateFileRecord[];
  readonly metadataChanged: readonly StateFileRecord[];
  readonly hasChanges: boolean;
  readonly summary: DeltaSummaryStatistics;
}

export interface RepositorySnapshot {
  readonly state: RepositoryState;
  readonly facts: RepositoryFacts;
  readonly delta: DeltaResult;
  readonly statistics: ScanStatistics;
  readonly createdAt: string;
}
