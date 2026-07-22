import type { ASTTree, NormalizedSymbol, ASTNode, SymbolKind } from '@repo-intel/shared';
import type { LanguageId } from '@repo-intel/shared';

/**
 * Normalizes a parsed ASTTree into language-agnostic NormalizedSymbol objects.
 * This is an interface-only implementation — Phase 12 will provide language-specific
 * symbol extractors (TypeScript, Python, Go) using real Tree-Sitter S-expression queries.
 */
export function normalizeTree(tree: ASTTree, languageId: LanguageId): NormalizedSymbol[] {
  if (tree.hasErrors || tree.rootNode.type === 'unknown') {
    return [];
  }

  const symbols: NormalizedSymbol[] = [];
  visitNode(tree.rootNode, symbols, languageId);
  return symbols;
}

function visitNode(node: ASTNode, symbols: NormalizedSymbol[], languageId: LanguageId): void {
  const kind = inferSymbolKind(node.type, languageId);
  if (kind && node.isNamed && node.text.trim().length > 0) {
    symbols.push({
      kind,
      name: extractName(node),
      range: node.range,
      isExported: false, // Phase 12 will detect exports via query captures
      signature: undefined,
    });
  }

  for (const child of node.children) {
    visitNode(child, symbols, languageId);
  }
}

function extractName(node: ASTNode): string {
  // In Phase 12, name nodes will be captured via Tree-Sitter query captures
  return node.type;
}

function inferSymbolKind(nodeType: string, _languageId: LanguageId): SymbolKind | null {
  const mapping: Record<string, SymbolKind> = {
    function_declaration: 'function',
    function_definition: 'function',
    method_declaration: 'method',
    method_definition: 'method',
    class_declaration: 'class',
    class_definition: 'class',
    interface_declaration: 'interface',
    variable_declaration: 'variable',
    import_declaration: 'import',
    import_statement: 'import',
    export_statement: 'export',
    enum_declaration: 'enum',
    type_alias_declaration: 'type_alias',
  };

  return mapping[nodeType] ?? null;
}
