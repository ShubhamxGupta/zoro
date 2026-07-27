import type { SymbolKind } from '../types/ast.types.js';
import type { NormalizedConcept } from '../types/cross-language.types.js';

export function mapToNormalizedConcept(kind: SymbolKind, signature?: string): NormalizedConcept {
  switch (kind) {
    case 'class':
      return 'ClassLike';
    case 'interface':
      return 'InterfaceLike';
    case 'enum':
      return 'EnumLike';
    case 'function':
    case 'method':
      return 'FunctionLike';
    case 'module':
    case 'import':
    case 'export':
      return 'ModuleLike';
    case 'type_alias':
      return signature?.includes('interface') ? 'InterfaceLike' : 'ClassLike';
    default:
      return 'VariableLike';
  }
}
