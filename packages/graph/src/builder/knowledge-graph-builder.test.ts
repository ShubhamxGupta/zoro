import { describe, it, expect, beforeEach } from 'vitest';
import type { FileNode, SemanticRelationship, DeltaResult } from '@repo-intel/shared';
import { InMemoryGraphStore } from '../storage/in-memory-graph-store.js';
import { KnowledgeGraphBuilder } from './knowledge-graph-builder.js';

describe('KnowledgeGraphBuilder', () => {
  let store: InMemoryGraphStore;
  let builder: KnowledgeGraphBuilder;

  beforeEach(() => {
    store = new InMemoryGraphStore();
    builder = new KnowledgeGraphBuilder(store);
  });

  it('builds full repository graph with directories, files, symbols, and edges', async () => {
    const file1: FileNode = {
      id: 'local-repo::file::src/services/user.ts',
      path: 'src/services/user.ts',
      sha256: 'abc123hash',
      language: 'typescript',
      loc: 50,
      symbols: [
        {
          id: 'local-repo::src/services/user.ts::UserService',
          symbolId: 'local-repo::src/services/user.ts::UserService',
          name: 'UserService',
          kind: 'class',
          fileId: 'src/services/user.ts',
          location: { filePath: 'src/services/user.ts', startLine: 1, startColumn: 0, endLine: 20, endColumn: 1 },
        },
      ],
      imports: [],
      exports: ['UserService'],
    };

    const relationships: SemanticRelationship[] = [
      {
        id: 'local-repo::file::src/services/user.ts->EXPORTS->local-repo::src/services/user.ts::UserService',
        type: 'EXPORTS',
        sourceId: 'local-repo::file::src/services/user.ts',
        targetId: 'local-repo::src/services/user.ts::UserService',
      },
    ];

    const stats = await builder.buildFullGraph({
      repoId: 'test-repo',
      repoName: 'zoro-test',
      files: [file1],
      relationships,
    });

    expect(stats.nodeCount).toBeGreaterThanOrEqual(4); // Repo, Dir, File, Symbol
    expect(stats.edgeCount).toBeGreaterThanOrEqual(3);

    const repoNodes = await store.queryNodes({ kind: 'Repository' });
    expect(repoNodes).toHaveLength(1);

    const symbolNodes = await store.queryNodes({ kind: 'Symbol' });
    expect(symbolNodes).toHaveLength(1);
    expect(symbolNodes[0]?.label).toBe('UserService');
  });

  it('performs incremental updates on graph deltas', async () => {
    const file1: FileNode = {
      id: 'local-repo::file::src/old.ts',
      path: 'src/old.ts',
      sha256: 'hash1',
      language: 'typescript',
      loc: 10,
      symbols: [
        {
          id: 'local-repo::src/old.ts::oldFunc',
          symbolId: 'local-repo::src/old.ts::oldFunc',
          name: 'oldFunc',
          kind: 'function',
          fileId: 'src/old.ts',
          location: { filePath: 'src/old.ts', startLine: 1, startColumn: 0, endLine: 5, endColumn: 1 },
        },
      ],
      imports: [],
      exports: [],
    };

    await builder.buildFullGraph({
      repoId: 'test-repo',
      repoName: 'zoro-test',
      files: [file1],
      relationships: [],
    });

    const dummyRecord = (path: string) => ({
      relativePath: path,
      sizeInBytes: 100,
      mtimeMs: Date.now(),
      languageId: 'typescript' as const,
      category: 'source' as const,
      isBinary: false,
    });

    const delta: DeltaResult = {
      added: [dummyRecord('src/new.ts')],
      modified: [],
      deleted: ['src/old.ts'],
      unchanged: [],
      renamed: [],
      moved: [],
      permissionChanged: [],
      metadataChanged: [],
      hasChanges: true,
      summary: {
        addedCount: 1,
        modifiedCount: 0,
        deletedCount: 1,
        unchangedCount: 0,
        renamedCount: 0,
        totalChangedFiles: 2,
      },
    };

    const newFile: FileNode = {
      id: 'local-repo::file::src/new.ts',
      path: 'src/new.ts',
      sha256: 'hash2',
      language: 'typescript',
      loc: 15,
      symbols: [
        {
          id: 'local-repo::src/new.ts::newFunc',
          symbolId: 'local-repo::src/new.ts::newFunc',
          name: 'newFunc',
          kind: 'function',
          fileId: 'src/new.ts',
          location: { filePath: 'src/new.ts', startLine: 1, startColumn: 0, endLine: 5, endColumn: 1 },
        },
      ],
      imports: [],
      exports: [],
    };

    await builder.updateGraphDelta(delta, [newFile], [], 'test-repo');

    const files = await store.queryNodes({ kind: 'File' });
    expect(files.find((f) => f.label === 'src/old.ts')).toBeUndefined();
    expect(files.find((f) => f.label === 'src/new.ts')).toBeDefined();
  });
});
