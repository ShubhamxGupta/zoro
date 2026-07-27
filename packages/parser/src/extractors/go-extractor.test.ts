import { describe, it, expect, beforeEach } from 'vitest';
import type { ASTNode, ASTTree, ASTRange } from '@repo-intel/shared';
import { GoExtractor } from './go-extractor.js';

describe('GoExtractor', () => {
  let extractor: GoExtractor;

  beforeEach(() => {
    extractor = new GoExtractor();
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
      languageId: 'go',
      sourceCode,
      hasErrors: false,
      diagnostics: [],
    };
  }

  it('has correct languageId and supportedExtensions', () => {
    expect(extractor.languageId).toBe('go');
    expect(extractor.supportedExtensions).toContain('.go');
  });

  it('extracts Go functions, struct methods, and exported capital naming', () => {
    const sourceCode = `package main

// Service handles main workflow
type Service struct{}

// Handle executes the request
func (s *Service) Handle(req string) error {
    return nil
}`;

    const typeName = createNode('type_identifier', 'Service');
    const typeSpec = createNode('type_spec', 'type Service struct{}', [typeName]);
    const typeDecl = createNode('type_declaration', 'type Service struct{}', [typeSpec]);

    const commentNode = createNode('comment', '// Handle executes the request');
    const methodName = createNode('field_identifier', 'Handle');
    const recType = createNode('type_identifier', 'Service');
    const recParams = createNode('parameter_list', '(s *Service)', [recType]);
    const methodParams = createNode('parameter_list', '(req string)');
    const methodDecl = createNode('method_declaration', 'func (s *Service) Handle(req string) error', [
      recParams,
      methodName,
      methodParams,
    ]);

    const fileNode = createNode('source_file', sourceCode, [typeDecl, commentNode, methodDecl]);
    const tree = createTree(fileNode, sourceCode);

    const result = extractor.extract(tree, 'main.go');

    expect(result.symbols).toHaveLength(2);

    const structSym = result.symbols.find((s) => s.kind === 'class')!;
    expect(structSym.name).toBe('Service');
    expect(structSym.modifiers).toContain('export');

    const methodSym = result.symbols.find((s) => s.kind === 'method')!;
    expect(methodSym.name).toBe('Service.Handle');
    expect(methodSym.signature).toBe('func (Service) Handle(req string)');
    expect(methodSym.documentation).toBe('Handle executes the request');
    expect(methodSym.modifiers).toContain('export');

    expect(result.exports).toEqual(expect.arrayContaining(['Service', 'Handle']));
  });

  it('extracts Go import statements', () => {
    const sourceCode = `import (
    "fmt"
    "net/http"
)`;

    const str1 = createNode('interpreted_string_literal', '"fmt"');
    const str2 = createNode('interpreted_string_literal', '"net/http"');
    const importDecl = createNode('import_declaration', sourceCode, [str1, str2]);

    const fileNode = createNode('source_file', sourceCode, [importDecl]);
    const tree = createTree(fileNode, sourceCode);

    const result = extractor.extract(tree, 'main.go');

    expect(result.imports).toHaveLength(2);
    expect(result.imports[0]?.sourcePath).toBe('fmt');
    expect(result.imports[1]?.sourcePath).toBe('net/http');
  });
});
