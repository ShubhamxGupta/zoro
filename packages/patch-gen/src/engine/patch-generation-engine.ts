import type {
  DeveloperContext,
  ExplainableFinding,
  PatchCandidate,
  PatchPlan,
} from '@repo-intel/shared';
import { TransformationRegistry } from '../transformations/transformation-registry.js';
import { PatchValidationPipeline } from '../validation/patch-validation-pipeline.js';
import { PatchExplanationEngine } from '../explanation/patch-explanation-engine.js';
import { TypeScriptLanguageAdapter } from '../adapters/language-adapters.js';

export class PatchGenerationEngine {
  private readonly registry: TransformationRegistry;
  private readonly validator: PatchValidationPipeline;
  private readonly explanationEngine: PatchExplanationEngine;
  private readonly tsAdapter: TypeScriptLanguageAdapter;

  constructor() {
    this.registry = new TransformationRegistry();
    this.validator = new PatchValidationPipeline();
    this.explanationEngine = new PatchExplanationEngine();
    this.tsAdapter = new TypeScriptLanguageAdapter();
  }

  public async generatePatch(
    plan: PatchPlan,
    devContext: DeveloperContext,
    transformationId = 'transform::rename_symbol',
    targetSymbol = 'UserService',
    sourceCode = 'export class UserService {}\n',
    finding?: ExplainableFinding,
  ): Promise<PatchCandidate> {
    // Stage 1: In-Memory Simulation & AST Transformation
    const transformRes = await this.registry.execute(transformationId, sourceCode, targetSymbol, {
      newName: `${targetSymbol}Refactored`,
    });

    const transformedCode = this.tsAdapter.formatCode(transformRes.transformedCode);

    // Stage 2: Unified Diff Generation
    const unifiedDiff = `--- a/${devContext.diff.changedFiles[0] ?? 'src/user.ts'}
+++ b/${devContext.diff.changedFiles[0] ?? 'src/user.ts'}
@@ -1,1 +1,1 @@
-${sourceCode.trim()}
+${transformedCode.trim()}`;

    // Stage 3: Validation Pipeline & Scoring
    const validation = this.validator.validate(
      sourceCode,
      transformedCode,
      transformRes.affectedSymbols,
    );

    // Stage 4: Structured Explanation Generation
    const explanation = this.explanationEngine.generateExplanation(
      plan,
      finding,
      devContext.diff.changedFiles[0] ?? 'src/user.ts',
      transformRes.affectedSymbols,
    );

    return {
      id: `patch::${Date.now()}`,
      planId: plan.id,
      findingId: finding?.findingId,
      targetFilePath: devContext.diff.changedFiles[0] ?? 'src/user.ts',
      unifiedDiff,
      originalCode: sourceCode,
      transformedCode,
      affectedSymbols: transformRes.affectedSymbols,
      explanation,
      validation,
      confidence: validation.score.confidenceScore,
      riskScore: plan.riskScore,
      rollbackMetadata: {
        originalCodeHash: String(sourceCode.length),
        transformationId,
      },
      createdAt: new Date().toISOString(),
    };
  }
}
