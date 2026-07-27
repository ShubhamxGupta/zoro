import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryGraphStore } from '../storage/in-memory-graph-store.js';
import { CrossLanguageResolver } from './cross-language-resolver.js';

describe('CrossLanguageResolver', () => {
  let store: InMemoryGraphStore;
  let resolver: CrossLanguageResolver;

  beforeEach(() => {
    store = new InMemoryGraphStore();
    resolver = new CrossLanguageResolver(store);
  });

  it('normalizes multi-language symbol kinds to unified NormalizedConcept abstractions', async () => {
    await store.addNode({
      id: 's::1',
      kind: 'Symbol',
      label: 'UserService',
      properties: { kind: 'class' },
    });
    await store.addNode({
      id: 's::2',
      kind: 'Symbol',
      label: 'IUserRepo',
      properties: { kind: 'interface' },
    });
    await store.addNode({
      id: 's::3',
      kind: 'Symbol',
      label: 'find_user',
      properties: { kind: 'function' },
    });

    await resolver.normalizeConcepts();

    const classNode = await store.getNode('s::1');
    expect(classNode?.concept).toBe('ClassLike');

    const interfaceNode = await store.getNode('s::2');
    expect(interfaceNode?.concept).toBe('InterfaceLike');

    const funcNode = await store.getNode('s::3');
    expect(funcNode?.concept).toBe('FunctionLike');
  });
});
