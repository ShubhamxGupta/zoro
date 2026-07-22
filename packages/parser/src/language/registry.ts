import type { LanguageId, FileCategory } from '@repo-intel/shared';

export interface LanguageSpec {
  languageId: LanguageId;
  extensions: string[];
  defaultCategory: FileCategory;
  treeSitterGrammar?: string;
  isSupportedByParser: boolean;
}

export const LANGUAGE_SPECS: LanguageSpec[] = [
  {
    languageId: 'typescript',
    extensions: ['.ts', '.tsx', '.mts', '.cts'],
    defaultCategory: 'source',
    treeSitterGrammar: 'tree-sitter-typescript',
    isSupportedByParser: true,
  },
  {
    languageId: 'javascript',
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    defaultCategory: 'source',
    treeSitterGrammar: 'tree-sitter-javascript',
    isSupportedByParser: true,
  },
  {
    languageId: 'python',
    extensions: ['.py', '.pyw', '.pyi'],
    defaultCategory: 'source',
    treeSitterGrammar: 'tree-sitter-python',
    isSupportedByParser: true,
  },
  {
    languageId: 'go',
    extensions: ['.go'],
    defaultCategory: 'source',
    treeSitterGrammar: 'tree-sitter-go',
    isSupportedByParser: true,
  },
  {
    languageId: 'rust',
    extensions: ['.rs'],
    defaultCategory: 'source',
    treeSitterGrammar: 'tree-sitter-rust',
    isSupportedByParser: false,
  },
  {
    languageId: 'java',
    extensions: ['.java'],
    defaultCategory: 'source',
    treeSitterGrammar: 'tree-sitter-java',
    isSupportedByParser: false,
  },
  {
    languageId: 'cpp',
    extensions: ['.cpp', '.cxx', '.cc', '.c', '.h', '.hpp', '.hxx'],
    defaultCategory: 'source',
    treeSitterGrammar: 'tree-sitter-cpp',
    isSupportedByParser: false,
  },
  {
    languageId: 'csharp',
    extensions: ['.cs'],
    defaultCategory: 'source',
    treeSitterGrammar: 'tree-sitter-csharp',
    isSupportedByParser: false,
  },
  {
    languageId: 'json',
    extensions: ['.json', '.jsonc'],
    defaultCategory: 'config',
    isSupportedByParser: false,
  },
  {
    languageId: 'yaml',
    extensions: ['.yaml', '.yml'],
    defaultCategory: 'config',
    isSupportedByParser: false,
  },
  {
    languageId: 'markdown',
    extensions: ['.md', '.markdown', '.mdx'],
    defaultCategory: 'documentation',
    isSupportedByParser: false,
  },
  {
    languageId: 'html',
    extensions: ['.html', '.htm'],
    defaultCategory: 'asset',
    isSupportedByParser: false,
  },
  {
    languageId: 'css',
    extensions: ['.css', '.scss', '.less'],
    defaultCategory: 'asset',
    isSupportedByParser: false,
  },
];

const EXTENSION_MAP = new Map<string, LanguageSpec>();
for (const spec of LANGUAGE_SPECS) {
  for (const ext of spec.extensions) {
    EXTENSION_MAP.set(ext.toLowerCase(), spec);
  }
}

export function getLanguageSpecByExtension(ext: string): LanguageSpec | undefined {
  return EXTENSION_MAP.get(ext.toLowerCase());
}
