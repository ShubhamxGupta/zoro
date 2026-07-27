import type { GraphNode, GraphEdge, GraphStats, GraphNodeKind, GraphEdgeKind } from '../types/graph.types.js';
import type { GraphStore } from './graph-store.interface.js';

export class InMemoryGraphStore implements GraphStore {
  private readonly nodes = new Map<string, GraphNode>();
  private readonly edges = new Map<string, GraphEdge>();
  private readonly outboundIndex = new Map<string, Set<string>>();
  private readonly inboundIndex = new Map<string, Set<string>>();

  public async addNode(node: GraphNode): Promise<void> {
    this.nodes.set(node.id, { ...node });
  }

  public async addEdge(edge: GraphEdge): Promise<void> {
    this.edges.set(edge.id, { ...edge });

    if (!this.outboundIndex.has(edge.sourceId)) {
      this.outboundIndex.set(edge.sourceId, new Set());
    }
    this.outboundIndex.get(edge.sourceId)!.add(edge.id);

    if (!this.inboundIndex.has(edge.targetId)) {
      this.inboundIndex.set(edge.targetId, new Set());
    }
    this.inboundIndex.get(edge.targetId)!.add(edge.id);
  }

  public async removeNode(id: string): Promise<boolean> {
    const existed = this.nodes.delete(id);
    if (!existed) return false;

    // Clean up associated edges
    const outboundEdgeIds = Array.from(this.outboundIndex.get(id) ?? []);
    for (const edgeId of outboundEdgeIds) {
      await this.removeEdge(edgeId);
    }

    const inboundEdgeIds = Array.from(this.inboundIndex.get(id) ?? []);
    for (const edgeId of inboundEdgeIds) {
      await this.removeEdge(edgeId);
    }

    this.outboundIndex.delete(id);
    this.inboundIndex.delete(id);
    return true;
  }

  public async removeEdge(id: string): Promise<boolean> {
    const edge = this.edges.get(id);
    if (!edge) return false;

    this.outboundIndex.get(edge.sourceId)?.delete(id);
    this.inboundIndex.get(edge.targetId)?.delete(id);
    return this.edges.delete(id);
  }

  public async getNode(id: string): Promise<GraphNode | null> {
    const node = this.nodes.get(id);
    return node ? { ...node } : null;
  }

  public async getEdge(id: string): Promise<GraphEdge | null> {
    const edge = this.edges.get(id);
    return edge ? { ...edge } : null;
  }

  public async queryNodes(filter?: Partial<GraphNode>): Promise<GraphNode[]> {
    if (!filter) {
      return Array.from(this.nodes.values()).map((n) => ({ ...n }));
    }

    return Array.from(this.nodes.values())
      .filter((node) => {
        if (filter.kind && node.kind !== filter.kind) return false;
        if (filter.label && node.label !== filter.label) return false;
        if (filter.id && node.id !== filter.id) return false;
        return true;
      })
      .map((n) => ({ ...n }));
  }

  public async queryEdges(filter?: Partial<GraphEdge>): Promise<GraphEdge[]> {
    if (!filter) {
      return Array.from(this.edges.values()).map((e) => ({ ...e }));
    }

    return Array.from(this.edges.values())
      .filter((edge) => {
        if (filter.kind && edge.kind !== filter.kind) return false;
        if (filter.sourceId && edge.sourceId !== filter.sourceId) return false;
        if (filter.targetId && edge.targetId !== filter.targetId) return false;
        if (filter.id && edge.id !== filter.id) return false;
        return true;
      })
      .map((e) => ({ ...e }));
  }

  public async getOutboundEdges(nodeId: string): Promise<GraphEdge[]> {
    const edgeIds = this.outboundIndex.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds)
      .map((id) => this.edges.get(id))
      .filter((e): e is GraphEdge => e !== undefined);
  }

  public async getInboundEdges(nodeId: string): Promise<GraphEdge[]> {
    const edgeIds = this.inboundIndex.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds)
      .map((id) => this.edges.get(id))
      .filter((e): e is GraphEdge => e !== undefined);
  }

  public async getStats(): Promise<GraphStats> {
    const nodesByKind: Record<GraphNodeKind, number> = {
      Repository: 0,
      Directory: 0,
      File: 0,
      Symbol: 0,
      Module: 0,
    };

    const edgesByKind: Record<GraphEdgeKind, number> = {
      CONTAINS: 0,
      IMPORTS: 0,
      EXPORTS: 0,
      CALLS: 0,
      REFERENCES: 0,
      IMPLEMENTS: 0,
      EXTENDS: 0,
      DEPENDS_ON: 0,
      USES: 0,
      OVERRIDES: 0,
    };

    for (const node of this.nodes.values()) {
      nodesByKind[node.kind] = (nodesByKind[node.kind] || 0) + 1;
    }

    for (const edge of this.edges.values()) {
      edgesByKind[edge.kind] = (edgesByKind[edge.kind] || 0) + 1;
    }

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      nodesByKind,
      edgesByKind,
    };
  }

  public async commit(): Promise<void> {
    // In-memory backend commits synchronously
  }

  public async clear(): Promise<void> {
    this.nodes.clear();
    this.edges.clear();
    this.outboundIndex.clear();
    this.inboundIndex.clear();
  }
}
