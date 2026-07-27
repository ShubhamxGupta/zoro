import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGraphStore } from '../storage/in-memory-graph-store.js';
import { exportGraphJson, importGraphJson } from './graph-serializer.js';

describe('GraphSerializer', () => {
  let store: InMemoryGraphStore;

  beforeEach(() => {
    store = new InMemoryGraphStore();
  });

  it('exports graph to valid JSON string and re-imports back losslessly', async () => {
    await store.addNode({ id: 'r::1', kind: 'Repository', label: 'zoro', properties: { version: '0.13.0' } });
    await store.addNode({ id: 'f::1', kind: 'File', label: 'index.ts', properties: { loc: 100 } });
    await store.addEdge({ id: 'e::1', kind: 'CONTAINS', sourceId: 'r::1', targetId: 'f::1' });

    const jsonString = await exportGraphJson(store);
    expect(jsonString).toContain('"version": "1.0.0"');
    expect(jsonString).toContain('"zoro"');

    const newStore = new InMemoryGraphStore();
    await importGraphJson(jsonString, newStore);

    const stats = await newStore.getStats();
    expect(stats.nodeCount).toBe(2);
    expect(stats.edgeCount).toBe(1);

    const fileNode = await newStore.getNode('f::1');
    expect(fileNode?.label).toBe('index.ts');
  });
});
