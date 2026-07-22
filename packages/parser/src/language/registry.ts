import type { LanguageId, FileCategory } from '@repo-intel/shared';
import { LANGUAGES_DATA } from './resources/languages.data.js';

export interface LanguageSpec {
  languageId: LanguageId;
  displayName: string;
  extensions: string[];
  mimeTypes?: string[];
  defaultCategory: FileCategory;
  treeSitterGrammar?: string | null;
  parserPluginId?: string | null;
  isSupportedByParser?: boolean;
}

export const LANGUAGE_SPECS: LanguageSpec[] = LANGUAGES_DATA.map((spec) => ({
  ...spec,
  isSupportedByParser: Boolean(spec.treeSitterGrammar && ['typescript', 'javascript', 'python', 'go'].includes(spec.languageId)),
}));

const EXTENSION_MAP = new Map<string, LanguageSpec>();
for (const spec of LANGUAGE_SPECS) {
  for (const ext of spec.extensions) {
    EXTENSION_MAP.set(ext.toLowerCase(), spec);
  }
}

export function getLanguageSpecByExtension(ext: string): LanguageSpec | undefined {
  return EXTENSION_MAP.get(ext.toLowerCase());
}

export function getLanguageSpecById(id: LanguageId): LanguageSpec | undefined {
  return LANGUAGE_SPECS.find((s) => s.languageId === id);
}
