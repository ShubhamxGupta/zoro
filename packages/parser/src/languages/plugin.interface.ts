import type { LanguageId } from '@repo-intel/shared';

export interface LanguagePluginConfig {
  parserOptions?: Record<string, unknown>;
  enableTreeSitter?: boolean;
  customQueries?: Record<string, string>;
}

export interface LanguagePlugin {
  languageId: LanguageId;
  displayName: string;
  treeSitterGrammar?: string;
  extensions: string[];
  config: LanguagePluginConfig;
  getSymbolQueryPlaceholder?(): string;
}
