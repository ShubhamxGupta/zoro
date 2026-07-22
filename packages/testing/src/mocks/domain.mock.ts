import type { Finding, GraphNode, ASTNode } from '@repo-intel/shared';

export function createMockFinding(overrides?: Partial<Finding>): Finding {
  return {
    id: 'mock-finding-001',
    ruleId: 'SEC-001',
    title: 'Mock Security Finding',
    description: 'Potential unsanitized input passed to database query builder',
    severity: 'HIGH',
    category: 'SECURITY',
    status: 'OPEN',
    location: {
      filePath: 'packages/shared/src/sample.ts',
      startLine: 10,
      endLine: 12,
    },
    suggestedFix: 'Use parameter binding instead of string concatenation.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockGraphNode(overrides?: Partial<GraphNode>): GraphNode {
  return {
    id: 'node-001',
    type: 'Class',
    label: 'UserService',
    properties: {
      name: 'createMockGraphNode',
      filePath: 'packages/testing/src/mocks/domain.mock.ts',
    },
    ...overrides,
  };
}

export function createMockASTNode(overrides?: Partial<ASTNode>): ASTNode {
  return {
    id: 'ast-001',
    type: 'FunctionDeclaration',
    name: 'testFunction',
    range: {
      start: { line: 1, column: 0 },
      end: { line: 5, column: 1 },
    },
    children: [],
    ...overrides,
  };
}
