import { describe, test, expect } from 'vitest';
import type {
  SymbolNode,
  FileNode,
  GraphNode,
  GraphEdge,
  ExplainableFinding,
  RiskScore,
} from './index.js';

describe('Shared Domain Models & Type Verification', () => {
  test('constructs valid AST Symbol & File nodes', () => {
    const symbol: SymbolNode = {
      id: 'sym-001',
      name: 'UserService',
      kind: 'class',
      fileId: 'file-001',
      location: {
        filePath: 'src/services/user.ts',
        startLine: 10,
        startColumn: 1,
        endLine: 50,
        endColumn: 2,
      },
      signature: 'export class UserService',
    };

    const file: FileNode = {
      id: 'file-001',
      path: 'src/services/user.ts',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      language: 'typescript',
      loc: 50,
      symbols: [symbol],
      imports: [],
      exports: ['UserService'],
    };

    expect(symbol.name).toBe('UserService');
    expect(file.language).toBe('typescript');
  });

  test('constructs valid Graph Nodes & Edges', () => {
    const graphNode: GraphNode = {
      id: 'node-001',
      type: 'Class',
      label: 'UserService',
      properties: { name: 'UserService' },
    };

    const graphEdge: GraphEdge = {
      id: 'edge-001',
      sourceId: 'node-001',
      targetId: 'node-002',
      relation: 'CALLS',
    };

    expect(graphNode.type).toBe('Class');
    expect(graphNode.label).toBe('UserService');
    expect(graphEdge.relation).toBe('CALLS');
  });

  test('constructs valid ExplainableFinding & RiskScore payload', () => {
    const finding: ExplainableFinding = {
      findingId: 'find-101',
      agentId: 'logic-agent',
      category: 'logic',
      severity: 'HIGH',
      confidenceScore: 0.95,
      filePath: 'src/services/user.ts',
      lineRange: { startLine: 25, endLine: 30 },
      explanation: {
        whatIsWrong: 'Missing null check before dereferencing user object',
        whyItMatters: 'Triggers uncaught TypeError crash when user is undefined',
        impactedComponents: ['UserService.findById', 'UserController.getUser'],
      },
      evidenceChain: [
        { description: 'Caller passes optional user parameter without validation', line: 25 },
      ],
      suggestedFix: {
        description: 'Add null check before accessing user.id',
        replacementCode: 'if (!user) throw new NotFoundError("User not found");',
      },
    };

    const risk: RiskScore = {
      overallScore: 0.72,
      riskLevel: 'HIGH',
      downstreamCallersCount: 4,
      criticalityRating: 0.8,
      testCoveragePercentage: 45.0,
      breakdown: {
        callerImpactScore: 0.35,
        criticalityScore: 0.25,
        untestedPathScore: 0.12,
      },
    };

    expect(finding.severity).toBe('HIGH');
    expect(risk.riskLevel).toBe('HIGH');
  });
});
