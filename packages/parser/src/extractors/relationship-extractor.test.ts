import { describe, it, expect, beforeEach } from 'vitest';
import type { SymbolNode, ImportStatement } from '@repo-intel/shared';
import { RelationshipExtractor } from './relationship-extractor.js';

describe('RelationshipExtractor', () => {
  let extractor: RelationshipExtractor;

  beforeEach(() => {
    extractor = new RelationshipExtractor();
  });

  it('extracts CONTAINS, EXTENDS, and IMPLEMENTS relationships from symbols', () => {
    const symbols: SymbolNode[] = [
      {
        id: 'local-repo::src/user.ts::UserService',
        symbolId: 'local-repo::src/user.ts::UserService',
        name: 'UserService',
        kind: 'class',
        fileId: 'src/user.ts',
        location: { filePath: 'src/user.ts', startLine: 1, startColumn: 0, endLine: 10, endColumn: 1 },
        signature: 'class UserService extends BaseService implements IUserService',
      },
      {
        id: 'local-repo::src/user.ts::UserService.findById',
        symbolId: 'local-repo::src/user.ts::UserService.findById',
        name: 'UserService.findById',
        kind: 'method',
        fileId: 'src/user.ts',
        location: { filePath: 'src/user.ts', startLine: 3, startColumn: 2, endLine: 5, endColumn: 3 },
      },
    ];

    const rels = extractor.extractRelationships({
      filePath: 'src/user.ts',
      symbols,
      imports: [],
      exports: ['UserService'],
    });

    expect(rels.find((r) => r.type === 'CONTAINS' && r.sourceId.includes('file::src/user.ts'))).toBeDefined();
    expect(rels.find((r) => r.type === 'CONTAINS' && r.sourceId.includes('UserService') && r.targetId.includes('findById'))).toBeDefined();
    expect(rels.find((r) => r.type === 'EXTENDS' && r.targetId === 'BaseService')).toBeDefined();
    expect(rels.find((r) => r.type === 'IMPLEMENTS' && r.targetId === 'IUserService')).toBeDefined();
    expect(rels.find((r) => r.type === 'EXPORTS' && r.metadata?.exportName === 'UserService')).toBeDefined();
  });

  it('extracts IMPORTS and DEPENDS_ON relationships from import statements', () => {
    const imports: ImportStatement[] = [
      { sourcePath: '@repo-intel/shared', importedSymbols: ['ASTTree'], isRelative: false, isWildcard: false },
      { sourcePath: './helper', importedSymbols: ['formatHelper'], isRelative: true, isWildcard: false },
    ];

    const rels = extractor.extractRelationships({
      filePath: 'src/index.ts',
      symbols: [],
      imports,
      exports: [],
    });

    expect(rels.filter((r) => r.type === 'IMPORTS')).toHaveLength(2);
    expect(rels.filter((r) => r.type === 'DEPENDS_ON')).toHaveLength(2);
    expect(rels.find((r) => r.targetId === 'module::@repo-intel/shared')).toBeDefined();
    expect(rels.find((r) => r.targetId === 'local-repo::file::./helper')).toBeDefined();
  });
});
