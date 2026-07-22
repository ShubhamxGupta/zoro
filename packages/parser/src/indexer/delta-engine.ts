import type { RepositoryState, DeltaResult, StateFileRecord } from '@repo-intel/shared';
import type { ClassifiedFile } from '@repo-intel/shared';
import { computeFileHash } from '../scanner/file-utils.js';

export class DeltaEngine {
  public async computeDelta(
    previousState: RepositoryState | null,
    currentFiles: ClassifiedFile[],
    options?: { forceRehash?: boolean },
  ): Promise<{ delta: DeltaResult; updatedManifest: Record<string, StateFileRecord>; hashOperationsCount: number }> {
    const previousManifest = previousState?.files ?? {};
    const updatedManifest: Record<string, StateFileRecord> = {};

    const added: StateFileRecord[] = [];
    const modified: StateFileRecord[] = [];
    const unchanged: StateFileRecord[] = [];
    const deleted: string[] = [];

    let hashOperationsCount = 0;

    const currentPaths = new Set<string>();

    for (const file of currentFiles) {
      currentPaths.add(file.relativePath);
      const prev = previousManifest[file.relativePath];

      let sha256 = file.sha256;

      if (!prev) {
        // File Added
        if (!sha256 && !file.isBinary) {
          sha256 = await computeFileHash(file.absolutePath);
          hashOperationsCount++;
        }

        const record: StateFileRecord = {
          relativePath: file.relativePath,
          sizeInBytes: file.sizeInBytes,
          mtimeMs: file.mtimeMs,
          sha256,
          languageId: file.languageId,
          category: file.category,
          isBinary: file.isBinary,
        };
        added.push(record);
        updatedManifest[file.relativePath] = record;
      } else {
        // Check Metadata short-circuit optimization: Compare size and mtime
        const isMetadataSame = prev.sizeInBytes === file.sizeInBytes && Math.abs(prev.mtimeMs - file.mtimeMs) < 2;

        if (isMetadataSame && !options?.forceRehash) {
          // Metadata identical -> Unchanged! Re-use cached SHA256 hash without reading file
          const record: StateFileRecord = {
            ...prev,
            mtimeMs: file.mtimeMs, // Normalize mtime jitter
          };
          unchanged.push(record);
          updatedManifest[file.relativePath] = record;
        } else {
          // Size or mtime changed -> Compute SHA256 to verify modification
          if (!sha256 && !file.isBinary) {
            sha256 = await computeFileHash(file.absolutePath);
            hashOperationsCount++;
          }

          if (sha256 && prev.sha256 && sha256 === prev.sha256) {
            // Hash identical despite mtime bump -> Unchanged!
            const record: StateFileRecord = {
              ...prev,
              mtimeMs: file.mtimeMs,
            };
            unchanged.push(record);
            updatedManifest[file.relativePath] = record;
          } else {
            // Content modified
            const record: StateFileRecord = {
              relativePath: file.relativePath,
              sizeInBytes: file.sizeInBytes,
              mtimeMs: file.mtimeMs,
              sha256,
              languageId: file.languageId,
              category: file.category,
              isBinary: file.isBinary,
            };
            modified.push(record);
            updatedManifest[file.relativePath] = record;
          }
        }
      }
    }

    // Detect Deleted Files
    for (const prevPath of Object.keys(previousManifest)) {
      if (!currentPaths.has(prevPath)) {
        deleted.push(prevPath);
      }
    }

    const hasChanges = added.length > 0 || modified.length > 0 || deleted.length > 0;

    return {
      delta: {
        added,
        modified,
        deleted,
        unchanged,
        renamed: [],
        moved: [],
        permissionChanged: [],
        metadataChanged: [],
        hasChanges,
        summary: {
          addedCount: added.length,
          modifiedCount: modified.length,
          deletedCount: deleted.length,
          unchangedCount: unchanged.length,
          renamedCount: 0,
          totalChangedFiles: added.length + modified.length + deleted.length,
        },
      },
      updatedManifest,
      hashOperationsCount,
    };
  }
}
