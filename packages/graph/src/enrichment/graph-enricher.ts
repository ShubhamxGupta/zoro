import type { ModuleResolver, TypeResolver, GraphProvenance } from '@repo-intel/shared';
import type { GraphStore } from '../storage/graph-store.interface.js';
import type { GraphEdge, GraphStats } from '../types/graph.types.js';

export interface GraphEnrichmentOptions {
  provenanceExtractorName?: string;
  defaultConfidence?: number;
}

export class GraphEnricher {
  constructor(
    private readonly store: GraphStore,
    private readonly moduleResolver: ModuleResolver,
    _typeResolver: TypeResolver,
    private readonly options: GraphEnrichmentOptions = {},
  ) {}

  public async enrichGraph(availableFiles: string[]): Promise<GraphStats> {
    const timestamp = new Date().toISOString();
    const extractor = this.options.provenanceExtractorName ?? 'GraphEnricher';
    const confidence = this.options.defaultConfidence ?? 0.9;

    // Pass 1: Resolve File Imports
    const importEdges = await this.store.queryEdges({ kind: 'IMPORTS' });
    for (const edge of importEdges) {
      const sourceFileNode = await this.store.getNode(edge.sourceId);
      if (sourceFileNode && sourceFileNode.kind === 'File') {
        const sourcePath = String(edge.properties?.sourcePath ?? edge.targetId);
        const resolved = await this.moduleResolver.resolveModule(
          {
            sourcePath,
            importedSymbols: [],
            isRelative: sourcePath.startsWith('.'),
            isWildcard: false,
          },
          sourceFileNode.label,
          availableFiles,
        );

        const targetNodeId = resolved.resolvedFilePath
          ? sourceFileNode.id.replace(/::file::.*$/, `::file::${resolved.resolvedFilePath}`)
          : resolved.resolvedModuleId;

        const provenance: GraphProvenance = {
          extractor,
          language: String(sourceFileNode.properties.language ?? 'unknown'),
          evidence: `Resolved import '${sourcePath}' from ${sourceFileNode.label}`,
          confidence,
          timestamp,
        };

        const enrichedEdge: GraphEdge = {
          id: `${edge.sourceId}->IMPORTS->${targetNodeId}`,
          kind: 'IMPORTS',
          sourceId: edge.sourceId,
          targetId: targetNodeId,
          provenance,
          properties: { ...edge.properties, resolvedFilePath: resolved.resolvedFilePath },
        };
        await this.store.addEdge(enrichedEdge);
      }
    }

    // Pass 2: Method Overrides Resolution
    const symbolNodes = await this.store.queryNodes({ kind: 'Symbol' });
    const classSymbols = symbolNodes.filter(
      (s: { properties: Record<string, unknown> }) => s.properties.kind === 'class',
    );

    for (const classNode of classSymbols) {
      const containsEdges = await this.store.getOutboundEdges(classNode.id);
      const methodNodes = (
        await Promise.all(containsEdges.map((e) => this.store.getNode(e.targetId)))
      ).filter((n): n is NonNullable<typeof n> => n !== null && n.properties.kind === 'method');

      // Check inheritance
      const extendsEdges = (await this.store.getOutboundEdges(classNode.id)).filter(
        (e) => e.kind === 'EXTENDS',
      );

      for (const extEdge of extendsEdges) {
        const parentClassNode = await this.store.getNode(extEdge.targetId);
        if (parentClassNode) {
          const parentContains = await this.store.getOutboundEdges(parentClassNode.id);
          const parentMethods = (
            await Promise.all(parentContains.map((e) => this.store.getNode(e.targetId)))
          ).filter((n): n is NonNullable<typeof n> => n !== null && n.properties.kind === 'method');

          for (const method of methodNodes) {
            const methodName = method.label.split('.').pop();
            const parentMethod = parentMethods.find(
              (pm) => pm.label.split('.').pop() === methodName,
            );

            if (parentMethod) {
              const overrideProvenance: GraphProvenance = {
                extractor,
                language: String(classNode.properties.language ?? 'unknown'),
                evidence: `Method ${method.label} overrides parent method ${parentMethod.label}`,
                confidence: 0.95,
                timestamp,
              };

              await this.store.addEdge({
                id: `${method.id}->OVERRIDES->${parentMethod.id}`,
                kind: 'OVERRIDES',
                sourceId: method.id,
                targetId: parentMethod.id,
                provenance: overrideProvenance,
              });
            }
          }
        }
      }
    }

    await this.store.commit();
    return this.store.getStats();
  }
}
