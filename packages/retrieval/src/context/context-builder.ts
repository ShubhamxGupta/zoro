import type { GraphStore, GraphNode } from '@repo-intel/graph';

export class ContextBuilder {
  constructor(private readonly store: GraphStore) {}

  public async buildContextForNode(nodeId: string): Promise<{ text: string; node: GraphNode } | undefined> {
    const node = await this.store.getNode(nodeId);
    if (!node) return undefined;

    const parts: string[] = [];

    parts.push(`Entity: ${node.label}`);
    parts.push(`Kind: ${node.kind}`);

    if (node.concept) {
      parts.push(`Concept: ${node.concept}`);
    }

    const props = node.properties;
    if (props.kind) parts.push(`SymbolKind: ${props.kind}`);
    if (props.signature) parts.push(`Signature: ${props.signature}`);
    if (props.documentation) parts.push(`Documentation: ${props.documentation}`);
    if (props.modifiers && Array.isArray(props.modifiers)) parts.push(`Modifiers: ${props.modifiers.join(', ')}`);
    if (props.language) parts.push(`Language: ${props.language}`);

    // Outbound relationships
    const outboundEdges = await this.store.getOutboundEdges(nodeId);
    for (const edge of outboundEdges) {
      const targetNode = await this.store.getNode(edge.targetId);
      const targetLabel = targetNode ? targetNode.label : edge.targetId;
      parts.push(`Relationship: ${edge.kind} -> ${targetLabel}`);
    }

    // Inbound relationships
    const inboundEdges = await this.store.getInboundEdges(nodeId);
    for (const edge of inboundEdges) {
      const sourceNode = await this.store.getNode(edge.sourceId);
      const sourceLabel = sourceNode ? sourceNode.label : edge.sourceId;
      parts.push(`Incoming Relationship: ${sourceLabel} -> ${edge.kind}`);
    }

    return {
      text: parts.join('\n'),
      node,
    };
  }

  public async buildAllContexts(): Promise<Array<{ text: string; node: GraphNode }>> {
    const allNodes = await this.store.queryNodes({});
    const results: Array<{ text: string; node: GraphNode }> = [];

    for (const node of allNodes) {
      const ctx = await this.buildContextForNode(node.id);
      if (ctx) results.push(ctx);
    }

    return results;
  }
}
