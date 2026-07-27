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

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  kind: GraphEdgeKind;
  sourceId: string;
  targetId: string;
  properties?: Record<string, unknown>;
}

export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  nodesByKind: Record<GraphNodeKind, number>;
  edgesByKind: Record<GraphEdgeKind, number>;
}
