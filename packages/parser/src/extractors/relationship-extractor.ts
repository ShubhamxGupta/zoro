import type { SymbolNode, ImportStatement, SemanticRelationship } from '@repo-intel/shared';

export interface RelationshipExtractorInput {
  filePath: string;
  symbols: SymbolNode[];
  imports: ImportStatement[];
  exports: string[];
  repoId?: string;
}

export class RelationshipExtractor {
  public extractRelationships(input: RelationshipExtractorInput): SemanticRelationship[] {
    const relationships: SemanticRelationship[] = [];
    const repoId = input.repoId ?? 'local-repo';
    const fileId = `${repoId}::file::${input.filePath}`;

    // 1. CONTAINS relationships (File -> Symbol)
    for (const sym of input.symbols) {
      relationships.push({
        id: `${fileId}->CONTAINS->${sym.symbolId}`,
        type: 'CONTAINS',
        sourceId: fileId,
        targetId: sym.symbolId,
        metadata: { kind: sym.kind },
      });

      // Child symbol relationship (e.g. Class -> Method)
      if (sym.name.includes('.')) {
        const parts = sym.name.split('.');
        const parentName = parts.slice(0, -1).join('.');
        const parentSym = input.symbols.find((s) => s.name === parentName);
        if (parentSym) {
          relationships.push({
            id: `${parentSym.symbolId}->CONTAINS->${sym.symbolId}`,
            type: 'CONTAINS',
            sourceId: parentSym.symbolId,
            targetId: sym.symbolId,
          });
        }
      }

      // EXTENDS & IMPLEMENTS relationships from modifiers/signatures
      if (sym.kind === 'class' || sym.kind === 'interface') {
        if (sym.signature?.includes('extends')) {
          const match = sym.signature.match(/extends\s+([A-Za-z0-9_]+)/);
          if (match && match[1]) {
            relationships.push({
              id: `${sym.symbolId}->EXTENDS->${match[1]}`,
              type: 'EXTENDS',
              sourceId: sym.symbolId,
              targetId: match[1],
            });
          }
        }
        if (sym.signature?.includes('implements')) {
          const match = sym.signature.match(/implements\s+([A-Za-z0-9_]+)/);
          if (match && match[1]) {
            relationships.push({
              id: `${sym.symbolId}->IMPLEMENTS->${match[1]}`,
              type: 'IMPLEMENTS',
              sourceId: sym.symbolId,
              targetId: match[1],
            });
          }
        }
      }
    }

    // 2. IMPORTS & DEPENDS_ON relationships
    for (const imp of input.imports) {
      const targetId = imp.isRelative ? `${repoId}::file::${imp.sourcePath}` : `module::${imp.sourcePath}`;
      relationships.push({
        id: `${fileId}->IMPORTS->${targetId}`,
        type: 'IMPORTS',
        sourceId: fileId,
        targetId,
        metadata: { symbols: imp.importedSymbols, isRelative: imp.isRelative },
      });

      relationships.push({
        id: `${fileId}->DEPENDS_ON->${targetId}`,
        type: 'DEPENDS_ON',
        sourceId: fileId,
        targetId,
      });
    }

    // 3. EXPORTS relationships
    for (const expName of input.exports) {
      const targetSymbol = input.symbols.find((s) => s.name === expName);
      const targetId = targetSymbol ? targetSymbol.symbolId : `${fileId}::export::${expName}`;

      relationships.push({
        id: `${fileId}->EXPORTS->${targetId}`,
        type: 'EXPORTS',
        sourceId: fileId,
        targetId,
        metadata: { exportName: expName },
      });
    }

    return relationships;
  }
}
