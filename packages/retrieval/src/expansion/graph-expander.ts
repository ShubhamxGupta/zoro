import type { GraphStore, GraphNode, GraphEdge } from '@repo-intel/graph';
import type { ExpansionStrategy, RetrievalBundleEntity } from '@repo-intel/shared';

export class GraphExpander {
  constructor(private readonly store: GraphStore) {}

  public async expand(
    seedNodes: GraphNode[],
    strategies: ExpansionStrategy[],
    maxHops = 2,
  ): Promise<{ expandedEntities: RetrievalBundleEntity[]; relationships: GraphEdge[] }> {
    const visitedNodes = new Map<string, RetrievalBundleEntity>();
    const relationships = new Map<string, GraphEdge>();

    for (const seed of seedNodes) {
      visitedNodes.set(seed.id, {
        ...seed,
        retrievalProvenance: {
          stage: 'vector',
          explanation: `Seed entity retrieved via vector search (label: ${seed.label})`,
          expansionPath: [seed.id],
        },
      });
    }

    let currentLayer = [...seedNodes];

    for (let hop = 1; hop <= maxHops; hop++) {
      const nextLayer: GraphNode[] = [];

      for (const currNode of currentLayer) {
        const outbound = await this.store.getOutboundEdges(currNode.id);
        const inbound = await this.store.getInboundEdges(currNode.id);
        const allEdges = [...outbound, ...inbound];

        for (const edge of allEdges) {
          if (!this.shouldExpandEdge(edge.kind, strategies)) continue;

          relationships.set(edge.id, edge);

          const targetId = edge.sourceId === currNode.id ? edge.targetId : edge.sourceId;
          if (!visitedNodes.has(targetId)) {
            const node = await this.store.getNode(targetId);
            if (node) {
              const parentProv = visitedNodes.get(currNode.id)?.retrievalProvenance
                ?.expansionPath ?? [currNode.id];
              const path = [...parentProv, node.id];

              const expandedEntity: RetrievalBundleEntity = {
                ...node,
                retrievalProvenance: {
                  stage: 'expansion',
                  graphScore: Number((1 / (hop + 1)).toFixed(3)),
                  explanation: `Expanded via ${edge.kind} from ${currNode.label} (hop ${hop})`,
                  expansionPath: path,
                },
              };

              visitedNodes.set(node.id, expandedEntity);
              nextLayer.push(node);
            }
          }
        }
      }

      currentLayer = nextLayer;
      if (currentLayer.length === 0) break;
    }

    return {
      expandedEntities: Array.from(visitedNodes.values()),
      relationships: Array.from(relationships.values()),
    };
  }

  private shouldExpandEdge(edgeKind: string, strategies: ExpansionStrategy[]): boolean {
    if (strategies.includes('neighbours')) return true;
    if (strategies.includes('call_graph') && (edgeKind === 'CALLS' || edgeKind === 'OVERRIDES'))
      return true;
    if (strategies.includes('inheritance') && (edgeKind === 'EXTENDS' || edgeKind === 'IMPLEMENTS'))
      return true;
    if (strategies.includes('imports') && (edgeKind === 'IMPORTS' || edgeKind === 'EXPORTS'))
      return true;
    if (strategies.includes('dependencies') && edgeKind === 'DEPENDS_ON') return true;
    return false;
  }
}
