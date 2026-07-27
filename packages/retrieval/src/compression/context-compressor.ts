import type { GraphEdge } from '@repo-intel/graph';
import type { RetrievalBundleEntity } from '@repo-intel/shared';

export class ContextCompressor {
  public compress(
    entities: RetrievalBundleEntity[],
    relationships: GraphEdge[],
    tokenBudget = 2000,
  ): {
    compressedEntities: RetrievalBundleEntity[];
    compressedRelationships: GraphEdge[];
    evidence: string[];
  } {
    // Step 1: Deduplicate Entities by ID
    const entityMap = new Map<string, RetrievalBundleEntity>();
    for (const ent of entities) {
      if (!entityMap.has(ent.id)) {
        entityMap.set(ent.id, ent);
      } else {
        // Merge provenance if available
        const existing = entityMap.get(ent.id)!;
        if (ent.retrievalProvenance?.stage === 'vector') {
          existing.retrievalProvenance = ent.retrievalProvenance;
        }
      }
    }

    const uniqueEntities = Array.from(entityMap.values());

    // Sort by priority (vector seed first, then highest rank/graph score)
    uniqueEntities.sort((a, b) => {
      const stageScoreA = a.retrievalProvenance?.stage === 'vector' ? 2 : 1;
      const stageScoreB = b.retrievalProvenance?.stage === 'vector' ? 2 : 1;
      return stageScoreB - stageScoreA;
    });

    // Step 2: Budget Pruning
    const compressedEntities: RetrievalBundleEntity[] = [];
    const evidence: string[] = [];
    let currentChars = 0;
    const maxChars = tokenBudget * 4; // Approx 4 chars/token

    for (const ent of uniqueEntities) {
      const textChunk = `[${ent.kind}] ${ent.label} (ID: ${ent.id})`;
      if (currentChars + textChunk.length > maxChars) break;

      compressedEntities.push(ent);
      evidence.push(textChunk);
      currentChars += textChunk.length;
    }

    const allowedIds = new Set(compressedEntities.map((e) => e.id));

    // Step 3: Filter Relationships
    const compressedRelationships = relationships.filter(
      (rel) => allowedIds.has(rel.sourceId) && allowedIds.has(rel.targetId),
    );

    return {
      compressedEntities,
      compressedRelationships,
      evidence,
    };
  }
}
