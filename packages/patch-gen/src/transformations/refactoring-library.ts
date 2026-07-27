import type { ASTTransformation, TransformationResult } from '@repo-intel/shared';

export abstract class BaseTransformation implements ASTTransformation {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly category: string;

  public async validate(sourceCode: string, targetSymbol: string): Promise<boolean> {
    return Boolean(sourceCode) && Boolean(targetSymbol);
  }

  public async rollback(transformedCode: string): Promise<string> {
    return transformedCode;
  }

  abstract apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult>;
}

export class RenameSymbolTransformation extends BaseTransformation {
  readonly id = 'transform::rename_symbol';
  readonly name = 'Rename Symbol';
  readonly category = 'refactoring';

  public async apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult> {
    const newName = String(options?.['newName'] ?? `${targetSymbol}Renamed`);
    const regex = new RegExp(`\\b${targetSymbol}\\b`, 'g');
    const transformedCode = sourceCode.replace(regex, newName);

    return {
      success: true,
      transformedCode,
      affectedSymbols: [targetSymbol, newName],
    };
  }
}

export class RenameFileTransformation extends BaseTransformation {
  readonly id = 'transform::rename_file';
  readonly name = 'Rename File';
  readonly category = 'refactoring';

  public async apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult> {
    const newPath = String(options?.['newPath'] ?? targetSymbol);
    return {
      success: true,
      transformedCode: sourceCode,
      affectedSymbols: [targetSymbol, newPath],
    };
  }
}

export class ExtractMethodTransformation extends BaseTransformation {
  readonly id = 'transform::extract_method';
  readonly name = 'Extract Method';
  readonly category = 'refactoring';

  public async apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult> {
    const newMethodName = String(options?.['methodName'] ?? 'extractedMethod');
    const extractedBody = `\n  private ${newMethodName}() {\n    // Extracted logic\n  }\n`;
    const transformedCode = sourceCode + extractedBody;

    return {
      success: true,
      transformedCode,
      affectedSymbols: [targetSymbol, newMethodName],
    };
  }
}

export class InlineMethodTransformation extends BaseTransformation {
  readonly id = 'transform::inline_method';
  readonly name = 'Inline Method';
  readonly category = 'refactoring';

  public async apply(sourceCode: string, targetSymbol: string): Promise<TransformationResult> {
    return {
      success: true,
      transformedCode: sourceCode,
      affectedSymbols: [targetSymbol],
    };
  }
}

export class MoveFunctionTransformation extends BaseTransformation {
  readonly id = 'transform::move_function';
  readonly name = 'Move Function';
  readonly category = 'architecture';

  public async apply(sourceCode: string, targetSymbol: string): Promise<TransformationResult> {
    return {
      success: true,
      transformedCode: sourceCode,
      affectedSymbols: [targetSymbol],
    };
  }
}

export class InsertImportTransformation extends BaseTransformation {
  readonly id = 'transform::insert_import';
  readonly name = 'Insert Import';
  readonly category = 'imports';

  public async apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult> {
    const importPath = String(options?.['importPath'] ?? './module.js');
    const importLine = `import { ${targetSymbol} } from '${importPath}';\n`;
    const transformedCode = importLine + sourceCode;

    return {
      success: true,
      transformedCode,
      affectedSymbols: [targetSymbol],
    };
  }
}

export class RemoveImportTransformation extends BaseTransformation {
  readonly id = 'transform::remove_import';
  readonly name = 'Remove Import';
  readonly category = 'imports';

  public async apply(sourceCode: string, targetSymbol: string): Promise<TransformationResult> {
    const regex = new RegExp(`import\\s+{[^}]*\\b${targetSymbol}\\b[^}]*}\\s+from\\s+['"][^'"]+['"];?\\n?`, 'g');
    const transformedCode = sourceCode.replace(regex, '');

    return {
      success: true,
      transformedCode,
      affectedSymbols: [targetSymbol],
    };
  }
}

export class UpdateSignatureTransformation extends BaseTransformation {
  readonly id = 'transform::update_signature';
  readonly name = 'Update Signature';
  readonly category = 'refactoring';

  public async apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult> {
    const newParams = String(options?.['params'] ?? '...args: unknown[]');
    const regex = new RegExp(`(${targetSymbol}\\s*\\()[^)]*(\\))`, 'g');
    const transformedCode = sourceCode.replace(regex, `$1${newParams}$2`);

    return {
      success: true,
      transformedCode,
      affectedSymbols: [targetSymbol],
    };
  }
}

export class ChangeVisibilityTransformation extends BaseTransformation {
  readonly id = 'transform::change_visibility';
  readonly name = 'Change Visibility';
  readonly category = 'encapsulation';

  public async apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult> {
    const newVis = String(options?.['visibility'] ?? 'public');
    const regex = new RegExp(`(private|protected|public)\\s+(${targetSymbol})`, 'g');
    const transformedCode = sourceCode.replace(regex, `${newVis} $2`);

    return {
      success: true,
      transformedCode,
      affectedSymbols: [targetSymbol],
    };
  }
}

export class ReplaceExpressionTransformation extends BaseTransformation {
  readonly id = 'transform::replace_expression';
  readonly name = 'Replace Expression';
  readonly category = 'refactoring';

  public async apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult> {
    const replacement = String(options?.['replacement'] ?? 'null');
    const transformedCode = sourceCode.replace(targetSymbol, replacement);

    return {
      success: true,
      transformedCode,
      affectedSymbols: [targetSymbol],
    };
  }
}

export class AddDocumentationTransformation extends BaseTransformation {
  readonly id = 'transform::add_documentation';
  readonly name = 'Add Documentation';
  readonly category = 'documentation';

  public async apply(sourceCode: string, targetSymbol: string, options?: Record<string, unknown>): Promise<TransformationResult> {
    const docComment = String(options?.['doc'] ?? `/** Documented ${targetSymbol} */\n`);
    const regex = new RegExp(`(\\b(?:function|class|interface|public|private)\\s+${targetSymbol}\\b)`, 'g');
    const transformedCode = sourceCode.replace(regex, `${docComment}$1`);

    return {
      success: true,
      transformedCode,
      affectedSymbols: [targetSymbol],
    };
  }
}

export class RemoveDeadCodeTransformation extends BaseTransformation {
  readonly id = 'transform::remove_dead_code';
  readonly name = 'Remove Dead Code';
  readonly category = 'cleanup';

  public async apply(sourceCode: string, targetSymbol: string): Promise<TransformationResult> {
    const regex = new RegExp(`(?:function|class|const|let|var)\\s+${targetSymbol}\\b[^}]*}\\n?`, 'g');
    const transformedCode = sourceCode.replace(regex, '');

    return {
      success: true,
      transformedCode,
      affectedSymbols: [targetSymbol],
    };
  }
}
