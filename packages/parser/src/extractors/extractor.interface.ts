import type { ASTTree, SymbolNode, ImportStatement, ParseDiagnostic } from '@repo-intel/shared';

export interface ExtractedFileSymbols {
  symbols: SymbolNode[];
  imports: ImportStatement[];
  exports: string[];
  loc: number;
  diagnostics: ParseDiagnostic[];
}

export interface SymbolExtractor {
  readonly languageId: string;
  readonly supportedExtensions: readonly string[];
  extract(tree: ASTTree, filePath: string, repoId?: string): ExtractedFileSymbols;
}
