/**
 * AST Symbol & Syntax Tree Domain Models
 */

export type SymbolKind =
  | 'class'
  | 'interface'
  | 'function'
  | 'method'
  | 'variable'
  | 'constant'
  | 'type_alias'
  | 'enum'
  | 'property'
  | 'import'
  | 'export'
  | 'annotation'
  | 'comment'
  | 'module'
  | 'unknown';

export interface Location {
  filePath: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface SymbolNode {
  id: string;
  name: string;
  kind: SymbolKind;
  location: Location;
  fileId: string;
  signature?: string;
  documentation?: string;
  modifiers?: string[];
}

export interface ImportStatement {
  sourcePath: string;
  importedSymbols: string[];
  isRelative: boolean;
  isWildcard: boolean;
}

export interface FileNode {
  id: string;
  path: string;
  sha256: string;
  language: string;
  loc: number;
  symbols: SymbolNode[];
  imports: ImportStatement[];
  exports: string[];
}
