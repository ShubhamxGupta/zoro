import type { LanguagePlugin } from '../plugin.interface.js';

export const javaLanguagePlugin: LanguagePlugin = {
  languageId: 'java',
  displayName: 'Java Language Plugin',
  treeSitterGrammar: 'tree-sitter-java',
  extensions: ['.java'],
  config: { enableTreeSitter: false },
};
