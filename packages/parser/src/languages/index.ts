import type { LanguageId } from '@repo-intel/shared';
import type { LanguagePlugin } from './plugin.interface.js';
import { typescriptLanguagePlugin } from './typescript/plugin.js';
import { pythonLanguagePlugin } from './python/plugin.js';
import { goLanguagePlugin } from './go/plugin.js';
import { javaLanguagePlugin } from './java/plugin.js';
import { rustLanguagePlugin } from './rust/plugin.js';

export * from './plugin.interface.js';
export { typescriptLanguagePlugin, pythonLanguagePlugin, goLanguagePlugin, javaLanguagePlugin, rustLanguagePlugin };

const PLUGIN_REGISTRY = new Map<LanguageId, LanguagePlugin>([
  ['typescript', typescriptLanguagePlugin],
  ['javascript', typescriptLanguagePlugin],
  ['python', pythonLanguagePlugin],
  ['go', goLanguagePlugin],
  ['java', javaLanguagePlugin],
  ['rust', rustLanguagePlugin],
]);

export function getLanguagePlugin(id: LanguageId): LanguagePlugin | undefined {
  return PLUGIN_REGISTRY.get(id);
}
