/**
 * Language-Independent Semantic Relationship Types & Payload Contracts
 */

export type SemanticRelationshipType =
  | 'CONTAINS'
  | 'CALLS'
  | 'IMPORTS'
  | 'EXPORTS'
  | 'REFERENCES'
  | 'IMPLEMENTS'
  | 'EXTENDS'
  | 'USES'
  | 'DEPENDS_ON'
  | 'OVERRIDES';

export interface SemanticRelationship {
  id: string;
  type: SemanticRelationshipType;
  sourceId: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}
