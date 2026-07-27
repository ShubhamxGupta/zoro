import type { FileNode, SemanticRelationship, DeltaResult } from '@repo-intel/shared';
import type { GraphStore } from '../storage/graph-store.interface.js';
import type { GraphNode, GraphStats, GraphEdgeKind } from '../types/graph.types.js';

export interface KnowledgeGraphBuilderInput {
  repoId: string;
  repoName: string;
  files: FileNode[];
  relationships: SemanticRelationship[];
}

export class KnowledgeGraphBuilder {
  constructor(private readonly store: GraphStore) {}

  public async buildFullGraph(input: KnowledgeGraphBuilderInput): Promise<GraphStats> {
    await this.store.clear();

    const repoNodeId = `${input.repoId}::repo::${input.repoName}`;
    const repoNode: GraphNode = {
      id: repoNodeId,
      kind: 'Repository',
      label: input.repoName,
      properties: { repoId: input.repoId, createdAt: new Date().toISOString() },
    };
    await this.store.addNode(repoNode);

    const dirSet = new Set<string>();

    for (const file of input.files) {
      // Create Directory Nodes if missing
      const dirPath = this.getDirectoryPath(file.path);
      if (dirPath && !dirSet.has(dirPath)) {
        dirSet.add(dirPath);
        const dirNodeId = `${input.repoId}::dir::${dirPath}`;
        await this.store.addNode({
          id: dirNodeId,
          kind: 'Directory',
          label: dirPath,
          properties: { path: dirPath },
        });

        await this.store.addEdge({
          id: `${repoNodeId}->CONTAINS->${dirNodeId}`,
          kind: 'CONTAINS',
          sourceId: repoNodeId,
          targetId: dirNodeId,
        });
      }

      // Create File Node
      const fileNodeId = `${input.repoId}::file::${file.path}`;
      const fileGraphNode: GraphNode = {
        id: fileNodeId,
        kind: 'File',
        label: file.path,
        properties: {
          path: file.path,
          language: file.language,
          sha256: file.sha256,
          loc: file.loc,
        },
      };
      await this.store.addNode(fileGraphNode);

      const parentDirId = dirPath ? `${input.repoId}::dir::${dirPath}` : repoNodeId;
      await this.store.addEdge({
        id: `${parentDirId}->CONTAINS->${fileNodeId}`,
        kind: 'CONTAINS',
        sourceId: parentDirId,
        targetId: fileNodeId,
      });

      // Create Symbol Nodes & Edges
      for (const sym of file.symbols) {
        const symbolGraphNode: GraphNode = {
          id: sym.symbolId,
          kind: 'Symbol',
          label: sym.name,
          properties: {
            symbolId: sym.symbolId,
            kind: sym.kind,
            signature: sym.signature,
            documentation: sym.documentation,
            docModel: sym.docModel,
            location: sym.location,
            modifiers: sym.modifiers,
          },
        };
        await this.store.addNode(symbolGraphNode);

        await this.store.addEdge({
          id: `${fileNodeId}->CONTAINS->${sym.symbolId}`,
          kind: 'CONTAINS',
          sourceId: fileNodeId,
          targetId: sym.symbolId,
        });
      }
    }

    // Process Semantic Relationships
    for (const rel of input.relationships) {
      await this.store.addEdge({
        id: rel.id,
        kind: rel.type as GraphEdgeKind,
        sourceId: rel.sourceId,
        targetId: rel.targetId,
        properties: rel.metadata,
      });
    }

    await this.store.commit();
    return this.store.getStats();
  }

  public async updateGraphDelta(
    delta: DeltaResult,
    changedFiles: FileNode[],
    changedRelationships: SemanticRelationship[],
    repoId = 'local-repo'
  ): Promise<GraphStats> {
    const filesToRemove = [...delta.deleted, ...delta.modified];

    for (const filePath of filesToRemove) {
      const fileNodeId = `${repoId}::file::${filePath}`;

      // Retrieve associated symbols under this file
      const outbound = await this.store.getOutboundEdges(fileNodeId);
      for (const edge of outbound) {
        if (edge.kind === 'CONTAINS') {
          await this.store.removeNode(edge.targetId);
        }
      }

      await this.store.removeNode(fileNodeId);
    }

    // Add updated file nodes & symbols
    for (const file of changedFiles) {
      const fileNodeId = `${repoId}::file::${file.path}`;
      await this.store.addNode({
        id: fileNodeId,
        kind: 'File',
        label: file.path,
        properties: { path: file.path, language: file.language, sha256: file.sha256, loc: file.loc },
      });

      for (const sym of file.symbols) {
        await this.store.addNode({
          id: sym.symbolId,
          kind: 'Symbol',
          label: sym.name,
          properties: {
            symbolId: sym.symbolId,
            kind: sym.kind,
            signature: sym.signature,
            documentation: sym.documentation,
            docModel: sym.docModel,
            location: sym.location,
          },
        });

        await this.store.addEdge({
          id: `${fileNodeId}->CONTAINS->${sym.symbolId}`,
          kind: 'CONTAINS',
          sourceId: fileNodeId,
          targetId: sym.symbolId,
        });
      }
    }

    for (const rel of changedRelationships) {
      await this.store.addEdge({
        id: rel.id,
        kind: rel.type as GraphEdgeKind,
        sourceId: rel.sourceId,
        targetId: rel.targetId,
        properties: rel.metadata,
      });
    }

    await this.store.commit();
    return this.store.getStats();
  }

  private getDirectoryPath(filePath: string): string | null {
    const normalized = filePath.replace(/\\/g, '/');
    const idx = normalized.lastIndexOf('/');
    return idx !== -1 ? normalized.substring(0, idx) : null;
  }
}
