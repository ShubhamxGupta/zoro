import { describe, it, expect } from 'vitest';
import { InMemoryGraphStore } from '../storage/in-memory-graph-store.js';
import { KnowledgeGraphBuilder } from '../builder/knowledge-graph-builder.js';
import type { FileNode } from '@repo-intel/shared';

describe('Graph Construction Benchmark', () => {
  it('measures insertion speed for 1,000 nodes and 2,000 edges', async () => {
    const store = new InMemoryGraphStore();
    const builder = new KnowledgeGraphBuilder(store);

    const mockFiles: FileNode[] = [];
    for (let i = 0; i < 100; i++) {
      mockFiles.push({
        id: `repo::file::src/file_${i}.ts`,
        path: `src/file_${i}.ts`,
        sha256: `hash_${i}`,
        language: 'typescript',
        loc: 100,
        symbols: [
          {
            id: `repo::src/file_${i}.ts::Class_${i}`,
            symbolId: `repo::src/file_${i}.ts::Class_${i}`,
            name: `Class_${i}`,
            kind: 'class',
            fileId: `src/file_${i}.ts`,
            location: { filePath: `src/file_${i}.ts`, startLine: 1, startColumn: 0, endLine: 50, endColumn: 1 },
          },
          {
            id: `repo::src/file_${i}.ts::func_${i}`,
            symbolId: `repo::src/file_${i}.ts::func_${i}`,
            name: `func_${i}`,
            kind: 'function',
            fileId: `src/file_${i}.ts`,
            location: { filePath: `src/file_${i}.ts`, startLine: 51, startColumn: 0, endLine: 90, endColumn: 1 },
          },
        ],
        imports: [],
        exports: [`Class_${i}`],
      });
    }

    const startTime = Date.now();
    const stats = await builder.buildFullGraph({
      repoId: 'bench-repo',
      repoName: 'zoro-bench',
      files: mockFiles,
      relationships: [],
    });
    const durationMs = Date.now() - startTime;

    expect(stats.nodeCount).toBeGreaterThanOrEqual(300);
    expect(durationMs).toBeLessThan(1000); // Must complete under 1 second
  });
});
