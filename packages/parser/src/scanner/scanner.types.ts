/**
 * Repository Scanner & File Walker Type Definitions
 */

export interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  sizeInBytes: number;
  mtimeMs: number;
  isBinary: boolean;
  sha256?: string;
}

export interface RepoBoundary {
  rootPath: string;
  markerFound: string;
  isGitRepo: boolean;
}

export interface ScanProgress {
  scannedFilesCount: number;
  totalDiscoveredBytes: number;
  currentDirectory: string;
}

export type ScanProgressCallback = (progress: ScanProgress) => void;

export interface ScanOptions {
  rootPath: string;
  computeHashes?: boolean;
  followSymlinks?: boolean;
  maxFileSizeBytes?: number;
  customIgnorePatterns?: string[];
  signal?: AbortSignal;
  onProgress?: ScanProgressCallback;
}

export interface ScanResult {
  rootPath: string;
  files: ScannedFile[];
  totalFilesScanned: number;
  totalBytesScanned: number;
  durationMs: number;
  ignoredCount: number;
  isCancelled: boolean;
}
