import { mapToNormalizedConcept } from '@repo-intel/shared';
import type { SymbolKind } from '@repo-intel/shared';
import type { GraphStore } from '../storage/graph-store.interface.js';
import type { GraphStats } from '../types/graph.types.js';

export class CrossLanguageResolver {
  constructor(private readonly store: GraphStore) {}

  public async normalizeConcepts(): Promise<GraphStats> {
    const symbolNodes = await this.store.queryNodes({ kind: 'Symbol' });

    for (const node of symbolNodes) {
      const rawKind = (node.properties.kind as SymbolKind) || 'unknown';
      const signature = node.properties.signature as string | undefined;

      const concept = mapToNormalizedConcept(rawKind, signature);

      const updatedNode = {
        ...node,
        concept,
        properties: {
          ...node.properties,
          concept,
        },
      };

      await this.store.addNode(updatedNode);
    }

    await this.store.commit();
    return this.store.getStats();
  }
}
