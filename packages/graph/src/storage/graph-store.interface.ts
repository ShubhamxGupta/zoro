import type { GraphNode, GraphEdge, GraphStats } from '../types/graph.types.js';

export interface GraphStore {
  addNode(node: GraphNode): Promise<void>;
  addEdge(edge: GraphEdge): Promise<void>;
  removeNode(id: string): Promise<boolean>;
  removeEdge(id: string): Promise<boolean>;
  getNode(id: string): Promise<GraphNode | null>;
  getEdge(id: string): Promise<GraphEdge | null>;
  queryNodes(filter?: Partial<GraphNode>): Promise<GraphNode[]>;
  queryEdges(filter?: Partial<GraphEdge>): Promise<GraphEdge[]>;
  getOutboundEdges(nodeId: string): Promise<GraphEdge[]>;
  getInboundEdges(nodeId: string): Promise<GraphEdge[]>;
  getStats(): Promise<GraphStats>;
  commit(): Promise<void>;
  clear(): Promise<void>;
}
