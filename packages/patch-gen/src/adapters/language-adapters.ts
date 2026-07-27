import type { LanguageAdapter } from '@repo-intel/shared';

export class TypeScriptLanguageAdapter implements LanguageAdapter {
  readonly language = 'typescript';

  public parseAST(sourceCode: string): unknown {
    return { type: 'Program', body: sourceCode };
  }

  public buildNode(kind: string, properties: Record<string, unknown>): unknown {
    return { kind, ...properties };
  }

  public printCode(ast: unknown): string {
    if (typeof ast === 'object' && ast !== null && 'body' in ast) {
      return String((ast as { body: unknown }).body);
    }
    return String(ast);
  }

  public formatCode(sourceCode: string): string {
    return sourceCode.trim() + '\n';
  }
}

export class PythonLanguageAdapter implements LanguageAdapter {
  readonly language = 'python';

  public parseAST(sourceCode: string): unknown {
    return { type: 'Module', body: sourceCode };
  }

  public buildNode(kind: string, properties: Record<string, unknown>): unknown {
    return { kind, ...properties };
  }

  public printCode(ast: unknown): string {
    if (typeof ast === 'object' && ast !== null && 'body' in ast) {
      return String((ast as { body: unknown }).body);
    }
    return String(ast);
  }

  public formatCode(sourceCode: string): string {
    return sourceCode.trim() + '\n';
  }
}

export class GoLanguageAdapter implements LanguageAdapter {
  readonly language = 'go';

  public parseAST(sourceCode: string): unknown {
    return { type: 'File', body: sourceCode };
  }

  public buildNode(kind: string, properties: Record<string, unknown>): unknown {
    return { kind, ...properties };
  }

  public printCode(ast: unknown): string {
    if (typeof ast === 'object' && ast !== null && 'body' in ast) {
      return String((ast as { body: unknown }).body);
    }
    return String(ast);
  }

  public formatCode(sourceCode: string): string {
    return sourceCode.trim() + '\n';
  }
}

export class JavaLanguageAdapter implements LanguageAdapter {
  readonly language = 'java';

  public parseAST(sourceCode: string): unknown {
    return { type: 'CompilationUnit', body: sourceCode };
  }

  public buildNode(kind: string, properties: Record<string, unknown>): unknown {
    return { kind, ...properties };
  }

  public printCode(ast: unknown): string {
    if (typeof ast === 'object' && ast !== null && 'body' in ast) {
      return String((ast as { body: unknown }).body);
    }
    return String(ast);
  }

  public formatCode(sourceCode: string): string {
    return sourceCode.trim() + '\n';
  }
}
