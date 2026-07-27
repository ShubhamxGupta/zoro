import { describe, it, expect, beforeEach } from 'vitest';
import type { ASTNode, ASTTree, ASTRange } from '@repo-intel/shared';
import { PythonExtractor } from './py-extractor.js';

describe('PythonExtractor', () => {
  let extractor: PythonExtractor;

  beforeEach(() => {
    extractor = new PythonExtractor();
  });

  const dummyRange: ASTRange = {
    startLine: 1,
    startColumn: 0,
    endLine: 10,
    endColumn: 20,
    startByte: 0,
    endByte: 200,
  };

  function createNode(
    type: string,
    text: string,
    children: ASTNode[] = [],
    range: ASTRange = dummyRange
  ): ASTNode {
    const parentNode: ASTNode = {
      id: Math.floor(Math.random() * 100000),
      type,
      isNamed: true,
      text,
      range,
      children,
      hasError: false,
      isMissing: false,
    };

    for (const child of children) {
      child.parent = parentNode;
    }

    return parentNode;
  }

  function createTree(rootNode: ASTNode, sourceCode: string): ASTTree {
    return {
      rootNode,
      languageId: 'python',
      sourceCode,
      hasErrors: false,
      diagnostics: [],
    };
  }

  it('has correct languageId and supportedExtensions', () => {
    expect(extractor.languageId).toBe('python');
    expect(extractor.supportedExtensions).toContain('.py');
    expect(extractor.supportedExtensions).toContain('.pyi');
  });

  it('extracts Python class definitions and methods with docstrings', () => {
    const sourceCode = `class UserService:
    """Service handling user entity operations."""
    def find_by_id(self, user_id: str) -> dict:
        return {}`;

    const classNameNode = createNode('identifier', 'UserService');
    const docStringNode = createNode('string', '"""Service handling user entity operations."""');
    const docExpr = createNode('expression_statement', '...', [docStringNode]);

    const methodNameNode = createNode('identifier', 'find_by_id');
    const methodParams = createNode('parameters', '(self, user_id: str)');
    const methodType = createNode('type', 'dict');
    const methodBlock = createNode('block', 'return {}');
    const methodNode = createNode('function_definition', 'def find_by_id(self, user_id: str) -> dict:\n        return {}', [
      methodNameNode,
      methodParams,
      methodType,
      methodBlock,
    ]);

    const classBlock = createNode('block', '...', [docExpr, methodNode]);
    const classNode = createNode('class_definition', sourceCode, [classNameNode, classBlock]);

    const moduleNode = createNode('module', sourceCode, [classNode]);
    const tree = createTree(moduleNode, sourceCode);

    const result = extractor.extract(tree, 'services/user.py');

    expect(result.symbols).toHaveLength(2);

    const classSym = result.symbols.find((s) => s.kind === 'class')!;
    expect(classSym.name).toBe('UserService');
    expect(classSym.documentation).toBe('Service handling user entity operations.');

    const methodSym = result.symbols.find((s) => s.kind === 'method')!;
    expect(methodSym.name).toBe('UserService.find_by_id');
    expect(methodSym.signature).toBe('def find_by_id(self, user_id: str) -> dict');
  });

  it('extracts Python import and import_from statements', () => {
    const sourceCode = `import os
from typing import List, Optional`;

    const dotted1 = createNode('dotted_name', 'os');
    const import1 = createNode('import_statement', 'import os', [dotted1]);

    const relNode = createNode('dotted_name', 'typing');
    const id1 = createNode('identifier', 'List');
    const id2 = createNode('identifier', 'Optional');
    const import2 = createNode('import_from_statement', 'from typing import List, Optional', [relNode, id1, id2]);

    const moduleNode = createNode('module', sourceCode, [import1, import2]);
    const tree = createTree(moduleNode, sourceCode);

    const result = extractor.extract(tree, 'main.py');

    expect(result.imports).toHaveLength(2);
    expect(result.imports[0]?.sourcePath).toBe('os');
    expect(result.imports[1]?.sourcePath).toBe('typing');
    expect(result.imports[1]?.importedSymbols).toEqual(['List', 'Optional']);
  });
});
