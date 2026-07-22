/**
 * Repository Knowledge Graph (RKG) Domain Models
 */
export type NodeType = 'File' | 'Module' | 'Package' | 'Class' | 'Interface' | 'Function' | 'Variable' | 'APIEndpoint' | 'DatabaseModel' | 'ConfigurationKey' | 'UnitTest';
export type EdgeRelation = 'CONTAINS' | 'IMPORTS' | 'CALLS' | 'INHERITS_IMPLEMENTS' | 'MUTATES' | 'TESTED_BY' | 'CONFIGURES' | 'HANDLED_BY';
export interface GraphNode {
    id: string;
    type: NodeType;
    label: string;
    properties: Record<string, unknown>;
}
export interface GraphEdge {
    id: string;
    sourceId: string;
    targetId: string;
    relation: EdgeRelation;
    weight?: number;
    properties?: Record<string, unknown>;
}
export interface CallGraphEntry {
    callerSymbolId: string;
    calleeSymbolId: string;
    callLocation: {
        filePath: string;
        line: number;
    };
    isAsync: boolean;
}
export interface ContextSubgraph {
    seedSymbolIds: string[];
    nodes: GraphNode[];
    edges: GraphEdge[];
    totalTokens: number;
    truncated: boolean;
}
//# sourceMappingURL=graph.types.d.ts.map