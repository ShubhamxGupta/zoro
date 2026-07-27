import { describe, it, expect, beforeEach } from 'vitest';
import type { ASTNode, ASTTree, ASTRange } from '@repo-intel/shared';
import { JavaExtractor } from './java-extractor.js';

describe('JavaExtractor', () => {
  let extractor: JavaExtractor;

  beforeEach(() => {
    extractor = new JavaExtractor();
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
      languageId: 'java',
      sourceCode,
      hasErrors: false,
      diagnostics: [],
    };
  }

  it('has correct languageId and supportedExtensions', () => {
    expect(extractor.languageId).toBe('java');
    expect(extractor.supportedExtensions).toContain('.java');
  });

  it('extracts Java classes, methods, visibility modifiers, and JavaDoc', () => {
    const sourceCode = `/**
 * User Service Class
 */
public class UserService {
    /**
     * Find user by id
     */
    public User findById(String id) {
        return null;
    }
}`;

    const docNode1 = createNode('comment', '/**\n * User Service Class\n */');
    const classNameNode = createNode('identifier', 'UserService');

    const docNode2 = createNode('comment', '/**\n * Find user by id\n */');
    const methodNameNode = createNode('identifier', 'findById');
    const returnTypeNode = createNode('type_identifier', 'User');
    const paramsNode = createNode('formal_parameters', '(String id)');
    const methodNode = createNode('method_declaration', 'public User findById(String id) {\n return null;\n }', [
      returnTypeNode,
      methodNameNode,
      paramsNode,
    ]);

    const classBody = createNode('class_body', '{ ... }', [docNode2, methodNode]);
    const classNode = createNode('class_declaration', 'public class UserService', [classNameNode, classBody]);

    const compilationUnit = createNode('program', sourceCode, [docNode1, classNode]);
    const tree = createTree(compilationUnit, sourceCode);

    const result = extractor.extract(tree, 'UserService.java');

    expect(result.symbols).toHaveLength(2);

    const classSym = result.symbols.find((s) => s.kind === 'class')!;
    expect(classSym.name).toBe('UserService');
    expect(classSym.documentation).toBe('User Service Class');
    expect(classSym.modifiers).toContain('public');

    const methodSym = result.symbols.find((s) => s.kind === 'method')!;
    expect(methodSym.name).toBe('UserService.findById');
    expect(methodSym.signature).toBe('User findById(String id)');
    expect(methodSym.documentation).toBe('Find user by id');
    expect(methodSym.modifiers).toContain('public');

    expect(result.exports).toContain('UserService');
  });

  it('extracts Java import declarations', () => {
    const sourceCode = `import java.util.List;
import java.util.Map;`;

    const name1 = createNode('scoped_identifier', 'java.util.List');
    const import1 = createNode('import_declaration', 'import java.util.List;', [name1]);

    const name2 = createNode('scoped_identifier', 'java.util.Map');
    const import2 = createNode('import_declaration', 'import java.util.Map;', [name2]);

    const compilationUnit = createNode('program', sourceCode, [import1, import2]);
    const tree = createTree(compilationUnit, sourceCode);

    const result = extractor.extract(tree, 'Main.java');

    expect(result.imports).toHaveLength(2);
    expect(result.imports[0]?.sourcePath).toBe('java.util.List');
    expect(result.imports[1]?.sourcePath).toBe('java.util.Map');
  });
});
