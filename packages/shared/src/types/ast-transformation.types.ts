/**
 * AST Transformation Framework & Refactoring Library Domain Models
 */

export interface TransformationResult {
  success: boolean;
  transformedCode: string;
  affectedSymbols: string[];
  errorMessage?: string;
}

export interface ASTTransformation {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult>;
  validate(sourceCode: string, targetSymbol: string): Promise<boolean>;
  rollback(transformedCode: string): Promise<string>;
}

export interface TransformationCapability {
  id: string;
  name: string;
  category: string;
  supportedLanguages: string[];
}

export interface LanguageAdapter {
  readonly language: string;
  parseAST(sourceCode: string): unknown;
  buildNode(kind: string, properties: Record<string, unknown>): unknown;
  printCode(ast: unknown): string;
  formatCode(sourceCode: string): string;
}
