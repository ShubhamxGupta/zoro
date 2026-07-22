import type { LanguagePlugin } from '../plugin.interface.js';

export const typescriptLanguagePlugin: LanguagePlugin = {
  languageId: 'typescript',
  displayName: 'TypeScript / JavaScript Language Plugin',
  treeSitterGrammar: 'tree-sitter-typescript',
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  config: {
    enableTreeSitter: true,
    parserOptions: { jsx: true, tsconfigRootDir: '.' },
  },
  getSymbolQueryPlaceholder(): string {
    return '(function_declaration name: (identifier) @function.name)';
  },
};
