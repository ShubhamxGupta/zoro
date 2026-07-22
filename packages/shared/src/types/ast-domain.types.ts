/**
 * AST Domain Layer — Higher-level packages must consume these types,
 * never raw Tree-Sitter node types directly.
 */

import type { SymbolKind } from './ast.types.js';

export interface ASTRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  startByte: number;
  endByte: number;
}

export interface ASTNode {
  id: number;
  type: string;
  isNamed: boolean;
  text: string;
  range: ASTRange;
  children: ASTNode[];
  parent?: ASTNode;
  hasError: boolean;
  isMissing: boolean;
}

export interface ASTTree {
  rootNode: ASTNode;
  languageId: string;
  sourceCode: string;
  hasErrors: boolean;
  diagnostics: ParseDiagnostic[];
}

export interface ASTCursor {
  currentNode: ASTNode;
  gotoFirstChild(): boolean;
  gotoNextSibling(): boolean;
  gotoParent(): boolean;
  reset(node: ASTNode): void;
}

export interface ASTVisitor<T> {
  visitNode(node: ASTNode): T | null;
  visitTree(tree: ASTTree): T[];
}

export interface ASTQuery {
  pattern: string;
  language: string;
  execute(tree: ASTTree): ASTQueryMatch[];
}

export interface ASTQueryMatch {
  pattern: number;
  captures: ASTQueryCapture[];
}

export interface ASTQueryCapture {
  name: string;
  node: ASTNode;
}

// ─── Normalized Symbol Types ──────────────────────────────────────────────────

export interface NormalizedSymbol {
  kind: SymbolKind;
  name: string;
  range: ASTRange;
  isExported: boolean;
  docComment?: string;
  signature?: string;
  children?: NormalizedSymbol[];
  metadata?: Record<string, unknown>;
}

export interface ParseDiagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  range: ASTRange;
  code?: string;
  isSyntaxError: boolean;
  isMissingNode: boolean;
}

export interface ParseResult<T = NormalizedSymbol[]> {
  symbols: T;
  tree: ASTTree;
  diagnostics: ParseDiagnostic[];
  durationMs: number;
  languageId: string;
  filePath: string;
  hasErrors: boolean;
}
