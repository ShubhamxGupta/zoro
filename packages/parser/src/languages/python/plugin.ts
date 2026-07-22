import type { LanguagePlugin } from '../plugin.interface.js';

export const pythonLanguagePlugin: LanguagePlugin = {
  languageId: 'python',
  displayName: 'Python Language Plugin',
  treeSitterGrammar: 'tree-sitter-python',
  grammarId: 'python',
  extensions: ['.py', '.pyw', '.pyi'],
  queryDirectory: 'queries/python',
  config: { enableTreeSitter: true },
  capabilities: {
    supportsSymbolExtraction: true,
    supportsTypeInference: false,
    supportsCallGraph: false,
    supportsImportResolution: true,
    supportsIncrementalParsing: false,
  },
  getSymbolQueryPlaceholder(): string {
    return '(function_definition name: (identifier) @function.name)';
  },
};
