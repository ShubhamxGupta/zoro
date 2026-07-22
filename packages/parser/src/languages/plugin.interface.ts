import type { LanguageId } from '@repo-intel/shared';
import type { NormalizedSymbol, ParseResult } from '@repo-intel/shared';

export interface LanguagePluginCapabilities {
  supportsSymbolExtraction: boolean;
  supportsTypeInference: boolean;
  supportsCallGraph: boolean;
  supportsImportResolution: boolean;
  supportsIncrementalParsing: boolean;
}

export interface LanguagePluginConfig {
  parserOptions?: Record<string, unknown>;
  enableTreeSitter?: boolean;
  customQueries?: Record<string, string>;
}

export interface LanguagePlugin {
  languageId: LanguageId;
  displayName: string;
  treeSitterGrammar?: string;
  grammarId?: string;
  extensions: string[];
  queryDirectory: string;
  config: LanguagePluginConfig;
  capabilities: LanguagePluginCapabilities;
  /**
   * Parser factory placeholder — will return real Tree-Sitter parsers in Phase 12+
   */
  createParser?(): unknown;
  /**
   * AST normalizer placeholder — will extract NormalizedSymbols from ASTTree in Phase 12+
   */
  normalize?(parseResult: ParseResult): NormalizedSymbol[];
  getSymbolQueryPlaceholder?(): string;
}
