import type { LanguagePlugin } from '../plugin.interface.js';

export const goLanguagePlugin: LanguagePlugin = {
  languageId: 'go',
  displayName: 'Go Language Plugin',
  treeSitterGrammar: 'tree-sitter-go',
  extensions: ['.go'],
  config: {
    enableTreeSitter: true,
  },
  getSymbolQueryPlaceholder(): string {
    return '(function_declaration name: (identifier) @function.name)';
  },
};
