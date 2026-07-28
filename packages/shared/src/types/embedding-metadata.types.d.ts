/**
 * Vector Embedding Metadata Model
 */
export interface EmbeddingMetadata {
    provider: string;
    model: string;
    dimensions: number;
    graphVersion: string;
    contentHash: string;
    createdAt: string;
    entityKind: 'Repository' | 'Directory' | 'File' | 'Symbol' | 'Module';
    entityId: string;
    label: string;
    language?: string;
    repositoryId?: string;
}
//# sourceMappingURL=embedding-metadata.types.d.ts.map