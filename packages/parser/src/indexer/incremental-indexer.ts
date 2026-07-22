import path from 'node:path';
import type {
  RepositoryState,
  RepositorySnapshot,
  ScanStatistics,
} from '@repo-intel/shared';
import { walkRepository } from '../scanner/repo-walker.js';
import type { ScanOptions } from '../scanner/scanner.types.js';
import { classifyFile } from '../language/classifier.js';
import { extractRepoMetadata } from '../language/metadata-extractor.js';
import { JsonRepositoryStateStore } from './json-state-store.js';
import type { RepositoryStateStore } from './state-store.interface.js';
import { DeltaEngine } from './delta-engine.js';
import { extractRepositoryFacts } from './facts-extractor.js';
import { ScannerEventEmitter } from './events.js';

export interface IndexerOptions extends Omit<ScanOptions, 'rootPath'> {
  stateStore?: RepositoryStateStore;
  forceFullScan?: boolean;
}

export class IncrementalIndexer {
  private store: RepositoryStateStore;
  public events: ScannerEventEmitter;

  constructor(store?: RepositoryStateStore) {
    this.store = store ?? new JsonRepositoryStateStore();
    this.events = new ScannerEventEmitter();
  }

  public async scanRepository(
    targetPath: string,
    options: IndexerOptions = {},
  ): Promise<RepositorySnapshot> {
    const startTime = Date.now();
    const absoluteRoot = path.resolve(targetPath);

    this.events.emit('RepositoryOpened', { rootPath: absoluteRoot });

    // 1. Load previous state store cache unless forceFullScan
    const previousState = options.forceFullScan ? null : await this.store.load(absoluteRoot);

    // 2. Perform filesystem walk
    const scanResult = await walkRepository({
      rootPath: absoluteRoot,
      computeHashes: false, // Short-circuit hash computation; delta engine will compute lazily
      customIgnorePatterns: options.customIgnorePatterns,
      followSymlinks: options.followSymlinks,
      maxFileSizeBytes: options.maxFileSizeBytes,
      signal: options.signal,
      onProgress: options.onProgress,
    });

    if (scanResult.isCancelled) {
      this.events.emit('ScanCancelled', { rootPath: absoluteRoot });
    }

    this.events.emit('RepositoryScanned', { rootPath: absoluteRoot, fileCount: scanResult.files.length });

    // 3. Classify discovered files
    const classifiedFiles = await Promise.all(scanResult.files.map((file) => classifyFile(file)));

    // 4. Compute Delta Engine with Metadata Hash Optimization
    const deltaEngine = new DeltaEngine();
    const { delta, updatedManifest, hashOperationsCount } = await deltaEngine.computeDelta(
      previousState,
      classifiedFiles,
      { forceRehash: options.forceFullScan },
    );

    // Emit fine-grained file event notifications
    for (const added of delta.added) this.events.emit('FileAdded', { file: added });
    for (const modified of delta.modified) this.events.emit('FileModified', { file: modified });
    for (const deletedPath of delta.deleted) this.events.emit('FileDeleted', { relativePath: deletedPath });

    // 5. Extract Repository Metadata & Facts
    const repoMetadata = await extractRepoMetadata(scanResult.files, absoluteRoot);
    const repoFacts = await extractRepositoryFacts(repoMetadata, absoluteRoot, scanResult.files);

    // 6. Build Statistics
    const scanDurationMs = Date.now() - startTime;
    const statistics: ScanStatistics = {
      totalFiles: classifiedFiles.length,
      sourceFiles: repoMetadata.totalSourceFiles,
      testFiles: repoMetadata.totalTestFiles,
      configFiles: repoMetadata.fileCategoryBreakdown.config,
      binaryFiles: repoMetadata.fileCategoryBreakdown.binary,
      ignoredFiles: scanResult.ignoredCount,
      totalDirectories: 0,
      totalSizeBytes: scanResult.totalBytesScanned,
      scanDurationMs,
      hashOperations: hashOperationsCount,
    };

    // 7. Assemble RepositoryState and Save Cache Store
    const repositoryId = `repo-${path.basename(absoluteRoot)}`;
    const newState: RepositoryState = {
      version: 1,
      repositoryId,
      rootPath: absoluteRoot,
      lastScanTimestamp: new Date().toISOString(),
      scannerVersion: '0.8.0',
      files: updatedManifest,
      statistics,
    };

    await this.store.save(absoluteRoot, newState);

    const snapshot: RepositorySnapshot = {
      state: newState,
      facts: repoFacts,
      delta,
      statistics,
      createdAt: new Date().toISOString(),
    };

    this.events.emit('ScanCompleted', { snapshot });
    this.events.emit('RepositoryIndexed', { rootPath: absoluteRoot, totalFiles: classifiedFiles.length, durationMs: scanDurationMs });
    this.events.emit('RepositoryCompleted', { snapshot, totalParseTimeMs: 0 });

    return snapshot;
  }
}
