import type { LanguagePlugin } from '../plugin.interface.js';

export const rustLanguagePlugin: LanguagePlugin = {
  languageId: 'rust',
  displayName: 'Rust Language Plugin',
  treeSitterGrammar: 'tree-sitter-rust',
  grammarId: 'rust',
  extensions: ['.rs'],
  queryDirectory: 'queries/rust',
  config: { enableTreeSitter: false },
  capabilities: {
    supportsSymbolExtraction: false,
    supportsTypeInference: false,
    supportsCallGraph: false,
    supportsImportResolution: false,
    supportsIncrementalParsing: false,
  },
};
