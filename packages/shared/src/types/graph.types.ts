/**
 * Repository Knowledge Graph (RKG) Domain Models
 */

import type { NormalizedConcept } from './cross-language.types.js';
import type { GraphProvenance } from './provenance.types.js';

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

export interface CallGraphEntry {
  callerSymbolId: string;
  calleeSymbolId: string;
  callLocation: {
    filePath: string;
    line: number;
  };
  isAsync: boolean;
}

export interface ContextSubgraph {
  seedSymbolIds: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalTokens: number;
  truncated: boolean;
}
