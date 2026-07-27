/**
 * Repository Knowledge Graph (RKG) Entity & Edge Types
 */

export type GraphNodeKind = 'Repository' | 'Directory' | 'File' | 'Symbol' | 'Module';

export type GraphEdgeKind =
  | 'CONTAINS'
  | 'IMPORTS'
  | 'EXPORTS'
  | 'CALLS'
  | 'REFERENCES'
  | 'IMPLEMENTS'
  | 'EXTENDS'
  | 'DEPENDS_ON'
  | 'USES'
  | 'OVERRIDES';

import type { NormalizedConcept, GraphProvenance } from '@repo-intel/shared';

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  concept?: NormalizedConcept;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  kind: GraphEdgeKind;
  sourceId: string;
  targetId: string;
  provenance?: GraphProvenance;
  properties?: Record<string, unknown>;
}

export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  nodesByKind: Record<GraphNodeKind, number>;
  edgesByKind: Record<GraphEdgeKind, number>;
}
