import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultModuleResolver, DefaultTypeResolver } from '@repo-intel/parser';
import { InMemoryGraphStore } from '../storage/in-memory-graph-store.js';
import { GraphEnricher } from './graph-enricher.js';

describe('GraphEnricher', () => {
  let store: InMemoryGraphStore;
  let moduleResolver: DefaultModuleResolver;
  let typeResolver: DefaultTypeResolver;
  let enricher: GraphEnricher;

  beforeEach(() => {
    store = new InMemoryGraphStore();
    moduleResolver = new DefaultModuleResolver();
    typeResolver = new DefaultTypeResolver();
    enricher = new GraphEnricher(store, moduleResolver, typeResolver);
  });

  it('enriches imports edges and detects method overrides with graph provenance', async () => {
    // Set up File Nodes
    await store.addNode({
      id: 'repo::file::src/base.ts',
      kind: 'File',
      label: 'src/base.ts',
      properties: { language: 'typescript' },
    });
    await store.addNode({
      id: 'repo::file::src/child.ts',
      kind: 'File',
      label: 'src/child.ts',
      properties: { language: 'typescript' },
    });

    // Set up Class Nodes
    await store.addNode({
      id: 'sym::Base',
      kind: 'Symbol',
      label: 'BaseService',
      properties: { kind: 'class' },
    });
    await store.addNode({
      id: 'sym::Child',
      kind: 'Symbol',
      label: 'UserService',
      properties: { kind: 'class' },
    });

    // Set up Method Nodes
    await store.addNode({
      id: 'sym::Base.save',
      kind: 'Symbol',
      label: 'BaseService.save',
      properties: { kind: 'method' },
    });
    await store.addNode({
      id: 'sym::Child.save',
      kind: 'Symbol',
      label: 'UserService.save',
      properties: { kind: 'method' },
    });

    // Node containment
    await store.addEdge({
      id: 'e1',
      kind: 'CONTAINS',
      sourceId: 'sym::Base',
      targetId: 'sym::Base.save',
    });
    await store.addEdge({
      id: 'e2',
      kind: 'CONTAINS',
      sourceId: 'sym::Child',
      targetId: 'sym::Child.save',
    });

    // Inheritance edge
    await store.addEdge({
      id: 'e3',
      kind: 'EXTENDS',
      sourceId: 'sym::Child',
      targetId: 'sym::Base',
    });

    // Import edge needing resolution
    await store.addEdge({
      id: 'e4',
      kind: 'IMPORTS',
      sourceId: 'repo::file::src/child.ts',
      targetId: './base',
      properties: { sourcePath: './base' },
    });

    const stats = await enricher.enrichGraph(['src/base.ts', 'src/child.ts']);

    expect(stats.edgeCount).toBeGreaterThanOrEqual(4);

    const overrides = await store.queryEdges({ kind: 'OVERRIDES' });
    expect(overrides).toHaveLength(1);
    expect(overrides[0]?.sourceId).toBe('sym::Child.save');
    expect(overrides[0]?.targetId).toBe('sym::Base.save');
    expect(overrides[0]?.provenance).toBeDefined();
    expect(overrides[0]?.provenance?.confidence).toBeGreaterThan(0.9);
  });
});
