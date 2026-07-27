import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGraphStore } from '@repo-intel/graph';
import { ContextBuilder } from './context-builder.js';

describe('ContextBuilder', () => {
  let store: InMemoryGraphStore;
  let builder: ContextBuilder;

  beforeEach(() => {
    store = new InMemoryGraphStore();
    builder = new ContextBuilder(store);
  });

  it('builds rich contextual text from node properties and relationships', async () => {
    await store.addNode({
      id: 'sym::UserService',
      kind: 'Symbol',
      label: 'UserService',
      concept: 'ClassLike',
      properties: { kind: 'class', signature: 'class UserService', documentation: 'User management service' },
    });

    await store.addNode({
      id: 'sym::UserService.save',
      kind: 'Symbol',
      label: 'UserService.save',
      concept: 'FunctionLike',
      properties: { kind: 'method', signature: 'save(user: User): void' },
    });

    await store.addEdge({ id: 'e1', kind: 'CONTAINS', sourceId: 'sym::UserService', targetId: 'sym::UserService.save' });

    const ctx = await builder.buildContextForNode('sym::UserService');
    expect(ctx).toBeDefined();
    expect(ctx?.text).toContain('Entity: UserService');
    expect(ctx?.text).toContain('Concept: ClassLike');
    expect(ctx?.text).toContain('Relationship: CONTAINS -> UserService.save');
  });
});
