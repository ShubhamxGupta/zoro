import type { LanguagePlugin } from '../plugin.interface.js';

export const javaLanguagePlugin: LanguagePlugin = {
  languageId: 'java',
  displayName: 'Java Language Plugin',
  treeSitterGrammar: 'tree-sitter-java',
  grammarId: 'java',
  extensions: ['.java'],
  queryDirectory: 'queries/java',
  config: { enableTreeSitter: false },
  capabilities: {
    supportsSymbolExtraction: false,
    supportsTypeInference: false,
    supportsCallGraph: false,
    supportsImportResolution: false,
    supportsIncrementalParsing: false,
  },
};
