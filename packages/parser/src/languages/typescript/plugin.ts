import type { LanguagePlugin } from '../plugin.interface.js';

export const typescriptLanguagePlugin: LanguagePlugin = {
  languageId: 'typescript',
  displayName: 'TypeScript / JavaScript Language Plugin',
  treeSitterGrammar: 'tree-sitter-typescript',
  grammarId: 'typescript',
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  queryDirectory: 'queries/typescript',
  config: {
    enableTreeSitter: true,
    parserOptions: { jsx: true, tsconfigRootDir: '.' },
  },
  capabilities: {
    supportsSymbolExtraction: true,
    supportsTypeInference: false,
    supportsCallGraph: false,
    supportsImportResolution: true,
    supportsIncrementalParsing: true,
  },
  getSymbolQueryPlaceholder(): string {
    return '(function_declaration name: (identifier) @function.name)';
  },
};
