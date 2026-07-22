import type {
  SymbolNode,
  FileNode,
  GraphNode,
  GraphEdge,
  ExplainableFinding,
  RiskScore,
  ProviderConfig,
  CompletionRequest,
  GitDiffPayload,
} from './index.js';

export function runDomainTypeTests(): void {
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

  const graphNode: GraphNode = {
    id: 'node-001',
    type: 'Class',
    label: 'UserService',
    properties: { fileId: file.id },
  };

  const graphEdge: GraphEdge = {
    id: 'edge-001',
    sourceId: 'node-001',
    targetId: 'node-002',
    relation: 'CALLS',
  };

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

  const providerConfig: ProviderConfig = {
    providerId: 'ollama-local',
    type: 'ollama',
    baseUrl: 'http://localhost:11434',
    modelName: 'codellama',
  };

  const request: CompletionRequest = {
    requestId: 'req-999',
    systemPrompt: 'You are a code review assistant.',
    userPrompt: 'Review the diff.',
  };

  const diff: GitDiffPayload = {
    repositoryId: 'repo-zoro',
    commitHash: 'a1b2c3d4e5f6',
    branchName: 'main',
    changedFiles: [
      {
        newPath: 'src/services/user.ts',
        changeType: 'modified',
        hunks: [],
        addedLinesCount: 12,
        deletedLinesCount: 2,
      },
    ],
  };

  if (symbol.name !== 'UserService' || file.language !== 'typescript') {
    throw new Error('AST Symbol/File domain type verification failed');
  }
  if (graphNode.type !== 'Class' || graphEdge.relation !== 'CALLS') {
    throw new Error('Graph domain type verification failed');
  }
  if (finding.severity !== 'HIGH' || risk.riskLevel !== 'HIGH') {
    throw new Error('Finding/Risk domain type verification failed');
  }
  if (providerConfig.type !== 'ollama' || request.requestId !== 'req-999') {
    throw new Error('PAL domain type verification failed');
  }
  if (diff.branchName !== 'main') {
    throw new Error('Diff domain type verification failed');
  }

  console.info('All Phase 04 Shared Domain Models & Type Definition Tests Passed Cleanly!');
}
