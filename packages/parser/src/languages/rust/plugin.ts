import type { LanguagePlugin } from '../plugin.interface.js';

export const rustLanguagePlugin: LanguagePlugin = {
  languageId: 'rust',
  displayName: 'Rust Language Plugin',
  treeSitterGrammar: 'tree-sitter-rust',
  extensions: ['.rs'],
  config: { enableTreeSitter: false },
};
