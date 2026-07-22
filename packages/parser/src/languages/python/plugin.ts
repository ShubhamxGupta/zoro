import type { LanguagePlugin } from '../plugin.interface.js';

export const pythonLanguagePlugin: LanguagePlugin = {
  languageId: 'python',
  displayName: 'Python Language Plugin',
  treeSitterGrammar: 'tree-sitter-python',
  extensions: ['.py', '.pyw', '.pyi'],
  config: {
    enableTreeSitter: true,
  },
  getSymbolQueryPlaceholder(): string {
    return '(function_definition name: (identifier) @function.name)';
  },
};
