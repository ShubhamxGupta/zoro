import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGraphStore } from './in-memory-graph-store.js';
import type { GraphNode, GraphEdge } from '../types/graph.types.js';

describe('InMemoryGraphStore', () => {
  let store: InMemoryGraphStore;

  beforeEach(() => {
    store = new InMemoryGraphStore();
  });

  it('adds and retrieves nodes and edges', async () => {
    const node1: GraphNode = { id: 'repo::1', kind: 'Repository', label: 'zoro', properties: {} };
    const node2: GraphNode = { id: 'file::1', kind: 'File', label: 'main.ts', properties: {} };
    const edge: GraphEdge = { id: 'edge::1', kind: 'CONTAINS', sourceId: 'repo::1', targetId: 'file::1' };

    await store.addNode(node1);
    await store.addNode(node2);
    await store.addEdge(edge);

    const fetchedNode = await store.getNode('repo::1');
    expect(fetchedNode?.label).toBe('zoro');

    const outbound = await store.getOutboundEdges('repo::1');
    expect(outbound).toHaveLength(1);
    expect(outbound[0]?.targetId).toBe('file::1');

    const inbound = await store.getInboundEdges('file::1');
    expect(inbound).toHaveLength(1);
    expect(inbound[0]?.sourceId).toBe('repo::1');
  });

  it('queries nodes and edges by kind and parameters', async () => {
    await store.addNode({ id: 'f::1', kind: 'File', label: 'a.ts', properties: {} });
    await store.addNode({ id: 'f::2', kind: 'File', label: 'b.ts', properties: {} });
    await store.addNode({ id: 's::1', kind: 'Symbol', label: 'funcA', properties: {} });

    const fileNodes = await store.queryNodes({ kind: 'File' });
    expect(fileNodes).toHaveLength(2);

    const symbolNodes = await store.queryNodes({ kind: 'Symbol' });
    expect(symbolNodes).toHaveLength(1);
  });

  it('removes nodes and cascade removes associated edges', async () => {
    await store.addNode({ id: 'n::1', kind: 'File', label: 'a.ts', properties: {} });
    await store.addNode({ id: 'n::2', kind: 'Symbol', label: 'foo', properties: {} });
    await store.addEdge({ id: 'e::1', kind: 'CONTAINS', sourceId: 'n::1', targetId: 'n::2' });

    expect(await store.getNode('n::1')).not.toBeNull();
    expect(await store.getEdge('e::1')).not.toBeNull();

    await store.removeNode('n::1');

    expect(await store.getNode('n::1')).toBeNull();
    expect(await store.getEdge('e::1')).toBeNull();
  });
});
