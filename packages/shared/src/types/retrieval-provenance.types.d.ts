/**
 * Entity & Relationship Retrieval Provenance
 */
export interface EntityRetrievalProvenance {
    stage: 'vector' | 'expansion' | 'keyword' | 'merged';
    vectorScore?: number;
    graphScore?: number;
    rankingScore?: number;
    explanation: string;
    expansionPath?: string[];
}
//# sourceMappingURL=retrieval-provenance.types.d.ts.map