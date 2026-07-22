import type { LanguagePlugin } from '../plugin.interface.js';

export const goLanguagePlugin: LanguagePlugin = {
  languageId: 'go',
  displayName: 'Go Language Plugin',
  treeSitterGrammar: 'tree-sitter-go',
  grammarId: 'go',
  extensions: ['.go'],
  queryDirectory: 'queries/go',
  config: { enableTreeSitter: true },
  capabilities: {
    supportsSymbolExtraction: true,
    supportsTypeInference: false,
    supportsCallGraph: false,
    supportsImportResolution: true,
    supportsIncrementalParsing: false,
  },
  getSymbolQueryPlaceholder(): string {
    return '(function_declaration name: (identifier) @function.name)';
  },
};
