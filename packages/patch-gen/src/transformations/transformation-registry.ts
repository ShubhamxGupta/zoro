import type {
  ASTTransformation,
  TransformationCapability,
  TransformationResult,
} from '@repo-intel/shared';
import {
  RenameSymbolTransformation,
  RenameFileTransformation,
  ExtractMethodTransformation,
  InlineMethodTransformation,
  MoveFunctionTransformation,
  InsertImportTransformation,
  RemoveImportTransformation,
  UpdateSignatureTransformation,
  ChangeVisibilityTransformation,
  ReplaceExpressionTransformation,
  AddDocumentationTransformation,
  RemoveDeadCodeTransformation,
} from './refactoring-library.js';

export class TransformationRegistry {
  private readonly transformations = new Map<string, ASTTransformation>();

  constructor() {
    this.registerDefaults();
  }

  public register(transformation: ASTTransformation): void {
    this.transformations.set(transformation.id.toLowerCase(), transformation);
  }

  public get(id: string): ASTTransformation | undefined {
    return this.transformations.get(id.toLowerCase());
  }

  public listCapabilities(): TransformationCapability[] {
    return Array.from(this.transformations.values()).map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      supportedLanguages: ['typescript', 'javascript', 'python', 'go', 'java'],
    }));
  }

  public async execute(
    id: string,
    sourceCode: string,
    targetSymbol: string,
    options?: Record<string, unknown>,
  ): Promise<TransformationResult> {
    const transformation = this.get(id);
    if (!transformation) {
      return {
        success: false,
        transformedCode: sourceCode,
        affectedSymbols: [],
        errorMessage: `Transformation '${id}' not registered in registry.`,
      };
    }

    const isValid = await transformation.validate(sourceCode, targetSymbol);
    if (!isValid) {
      return {
        success: false,
        transformedCode: sourceCode,
        affectedSymbols: [],
        errorMessage: `Transformation validation failed for '${id}'.`,
      };
    }

    return transformation.apply(sourceCode, targetSymbol, options);
  }

  private registerDefaults(): void {
    this.register(new RenameSymbolTransformation());
    this.register(new RenameFileTransformation());
    this.register(new ExtractMethodTransformation());
    this.register(new InlineMethodTransformation());
    this.register(new MoveFunctionTransformation());
    this.register(new InsertImportTransformation());
    this.register(new RemoveImportTransformation());
    this.register(new UpdateSignatureTransformation());
    this.register(new ChangeVisibilityTransformation());
    this.register(new ReplaceExpressionTransformation());
    this.register(new AddDocumentationTransformation());
    this.register(new RemoveDeadCodeTransformation());
  }
}
