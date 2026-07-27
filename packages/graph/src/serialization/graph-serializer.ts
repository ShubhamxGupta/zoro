import type { GraphNode, GraphEdge, GraphStats } from '../types/graph.types.js';
import type { GraphStore } from '../storage/graph-store.interface.js';

export interface GraphSerializedData {
  version: string;
  createdAt: string;
  stats: GraphStats;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function exportGraphJson(store: GraphStore): Promise<string> {
  const nodes = await store.queryNodes();
  const edges = await store.queryEdges();
  const stats = await store.getStats();

  const payload: GraphSerializedData = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    stats,
    nodes,
    edges,
  };

  return JSON.stringify(payload, null, 2);
}

export async function importGraphJson(jsonString: string, store: GraphStore): Promise<void> {
  const payload = JSON.parse(jsonString) as GraphSerializedData;

  await store.clear();

  if (Array.isArray(payload.nodes)) {
    for (const node of payload.nodes) {
      await store.addNode(node);
    }
  }

  if (Array.isArray(payload.edges)) {
    for (const edge of payload.edges) {
      await store.addEdge(edge);
    }
  }

  await store.commit();
}
