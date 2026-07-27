import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGraphStore } from '@repo-intel/graph';
import { GraphExpander } from './graph-expander.js';

describe('GraphExpander', () => {
  let store: InMemoryGraphStore;
  let expander: GraphExpander;

  beforeEach(() => {
    store = new InMemoryGraphStore();
    expander = new GraphExpander(store);
  });

  it('performs multi-hop graph expansion following specified strategies', async () => {
    await store.addNode({
      id: 's::1',
      kind: 'Symbol',
      label: 'UserService',
      properties: { kind: 'class' },
    });
    await store.addNode({
      id: 's::2',
      kind: 'Symbol',
      label: 'saveUser',
      properties: { kind: 'method' },
    });
    await store.addNode({
      id: 's::3',
      kind: 'Symbol',
      label: 'auditLog',
      properties: { kind: 'function' },
    });

    await store.addEdge({ id: 'e1', kind: 'CALLS', sourceId: 's::1', targetId: 's::2' });
    await store.addEdge({ id: 'e2', kind: 'CALLS', sourceId: 's::2', targetId: 's::3' });

    const seedNode = (await store.getNode('s::1'))!;
    const { expandedEntities, relationships } = await expander.expand(
      [seedNode],
      ['call_graph'],
      2,
    );

    expect(expandedEntities).toHaveLength(3);
    expect(relationships).toHaveLength(2);
    expect(expandedEntities[2]?.retrievalProvenance?.expansionPath).toEqual([
      's::1',
      's::2',
      's::3',
    ]);
  });
});
