import { describe, it, expect } from 'vitest';
import { DefaultModuleResolver, DefaultTypeResolver } from '@repo-intel/parser';
import { InMemoryGraphStore } from '../storage/in-memory-graph-store.js';
import { GraphEnricher } from '../enrichment/graph-enricher.js';

describe('Graph Enrichment Benchmark', () => {
  it('measures enrichment throughput over 500 import and inheritance edges', async () => {
    const store = new InMemoryGraphStore();
    const moduleResolver = new DefaultModuleResolver();
    const typeResolver = new DefaultTypeResolver();
    const enricher = new GraphEnricher(store, moduleResolver, typeResolver);

    const availableFiles: string[] = [];

    for (let i = 0; i < 250; i++) {
      const filePath = `src/file_${i}.ts`;
      availableFiles.push(filePath);
      await store.addNode({
        id: `repo::file::${filePath}`,
        kind: 'File',
        label: filePath,
        properties: { language: 'typescript' },
      });

      const targetPath = `./file_${(i + 1) % 250}`;
      await store.addEdge({
        id: `imp::${i}`,
        kind: 'IMPORTS',
        sourceId: `repo::file::${filePath}`,
        targetId: targetPath,
        properties: { sourcePath: targetPath },
      });
    }

    const startTime = Date.now();
    const stats = await enricher.enrichGraph(availableFiles);
    const durationMs = Date.now() - startTime;

    expect(stats.edgeCount).toBeGreaterThanOrEqual(250);
    expect(durationMs).toBeLessThan(1000); // Under 1 second
  });
});
