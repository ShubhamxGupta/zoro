import { describe, it, expect } from 'vitest';
import { ContextCompressor } from './context-compressor.js';
import type { RetrievalBundleEntity } from '@repo-intel/shared';

describe('ContextCompressor', () => {
  it('deduplicates entities and prunes content to fit token budget', () => {
    const compressor = new ContextCompressor();

    const entities: RetrievalBundleEntity[] = [
      { id: '1', kind: 'Symbol', label: 'UserService', properties: {} },
      { id: '1', kind: 'Symbol', label: 'UserService', properties: {} },
      { id: '2', kind: 'File', label: 'user.ts', properties: {} },
    ];

    const { compressedEntities, evidence } = compressor.compress(entities, [], 100);

    expect(compressedEntities).toHaveLength(2);
    expect(evidence).toHaveLength(2);
  });
});
