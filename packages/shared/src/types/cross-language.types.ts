/**
 * Normalized Cross-Language Semantic Concepts
 */
export type NormalizedConcept =
  'ClassLike' | 'FunctionLike' | 'ModuleLike' | 'InterfaceLike' | 'EnumLike' | 'VariableLike';

export { mapToNormalizedConcept } from '../utils/cross-language-concept.js';
