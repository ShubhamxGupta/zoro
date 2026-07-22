import fs from 'node:fs/promises';
import path from 'node:path';
import type { ScanOptions, ScanResult, ScannedFile } from './scanner.types.js';
import { detectRepositoryRoot } from './root-detector.js';
import { IgnoreEvaluator } from './ignore-evaluator.js';
import { isBinaryFile, computeFileHash, SymlinkTracker } from './file-utils.js';

export async function walkRepository(options: ScanOptions): Promise<ScanResult> {
  const startTime = Date.now();
  const boundary = await detectRepositoryRoot(options.rootPath);
  const rootPath = boundary.rootPath;

  const ignoreEvaluator = new IgnoreEvaluator(options.customIgnorePatterns);
  await ignoreEvaluator.loadGitignore(rootPath);

  const symlinkTracker = new SymlinkTracker();
  const scannedFiles: ScannedFile[] = [];
  let totalBytesScanned = 0;
  let ignoredCount = 0;
  let isCancelled = false;

  const maxFileSize = options.maxFileSizeBytes ?? 10 * 1024 * 1024; // Default 10MB limit

  async function traverseDirectory(currentDir: string): Promise<void> {
    if (options.signal?.aborted) {
      isCancelled = true;
      return;
    }

    const relativeDir = path.relative(rootPath, currentDir);
    if (relativeDir && ignoreEvaluator.isIgnored(relativeDir)) {
      ignoredCount++;
      return;
    }

    options.onProgress?.({
      scannedFilesCount: scannedFiles.length,
      totalDiscoveredBytes: totalBytesScanned,
      currentDirectory: relativeDir || '.',
    });

    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (options.signal?.aborted) {
          isCancelled = true;
          return;
        }

        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, '/');

        if (ignoreEvaluator.isIgnored(relativePath)) {
          ignoredCount++;
          continue;
        }

        if (entry.isSymbolicLink()) {
          if (!options.followSymlinks) {
            ignoredCount++;
            continue;
          }
          const isLoop = await symlinkTracker.isCycleOrOutside(fullPath, rootPath);
          if (isLoop) {
            ignoredCount++;
            continue;
          }
        }

        if (entry.isDirectory()) {
          await traverseDirectory(fullPath);
        } else if (entry.isFile() || entry.isSymbolicLink()) {
          try {
            const stats = await fs.stat(fullPath);
            if (stats.size > maxFileSize) {
              ignoredCount++;
              continue;
            }

            const binary = await isBinaryFile(fullPath);
            const sha256 = options.computeHashes ? await computeFileHash(fullPath) : undefined;

            scannedFiles.push({
              relativePath,
              absolutePath: fullPath,
              sizeInBytes: stats.size,
              mtimeMs: stats.mtimeMs,
              isBinary: binary,
              sha256,
            });

            totalBytesScanned += stats.size;
          } catch {
            ignoredCount++;
          }
        }
      }
    } catch {
      // Directory unreadable
    }
  }

  await traverseDirectory(rootPath);

  return {
    rootPath,
    files: scannedFiles,
    totalFilesScanned: scannedFiles.length,
    totalBytesScanned,
    durationMs: Date.now() - startTime,
    ignoredCount,
    isCancelled,
  };
}
