import { describe, it, expect, beforeEach } from 'vitest';
import type { ASTNode, ASTTree, ASTRange } from '@repo-intel/shared';
import { TypeScriptExtractor } from './ts-extractor.js';

describe('TypeScriptExtractor', () => {
  let extractor: TypeScriptExtractor;

  beforeEach(() => {
    extractor = new TypeScriptExtractor();
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
      languageId: 'typescript',
      sourceCode,
      hasErrors: false,
      diagnostics: [],
    };
  }

  it('has correct languageId and supportedExtensions', () => {
    expect(extractor.languageId).toBe('typescript');
    expect(extractor.supportedExtensions).toContain('.ts');
    expect(extractor.supportedExtensions).toContain('.tsx');
    expect(extractor.supportedExtensions).toContain('.js');
    expect(extractor.supportedExtensions).toContain('.jsx');
  });

  it('extracts top-level function declarations with parameters and return types', () => {
    const sourceCode = `/**
 * Calculate total score
 */
export async function calculateTotal(a: number, b: number): number {
  return a + b;
}`;

    const docNode = createNode('comment', '/**\n * Calculate total score\n */');
    const nameNode = createNode('identifier', 'calculateTotal');
    const paramsNode = createNode('formal_parameters', '(a: number, b: number)');
    const returnTypeNode = createNode('type_annotation', ': number');
    
    const funcNode = createNode('function_declaration', 'export async function calculateTotal(a: number, b: number): number', [
      nameNode,
      paramsNode,
      returnTypeNode,
    ]);

    const programNode = createNode('program', sourceCode, [docNode, funcNode]);
    const tree = createTree(programNode, sourceCode);

    const result = extractor.extract(tree, 'src/math.ts');

    expect(result.symbols).toHaveLength(1);
    const sym = result.symbols[0]!;
    expect(sym.name).toBe('calculateTotal');
    expect(sym.kind).toBe('function');
    expect(sym.signature).toBe('calculateTotal(a: number, b: number): number');
    expect(sym.documentation).toBe('Calculate total score');
    expect(sym.modifiers).toContain('export');
    expect(sym.modifiers).toContain('async');
    expect(result.exports).toContain('calculateTotal');
  });

  it('extracts arrow functions assigned to const variables', () => {
    const sourceCode = `export const multiply = (x: number, y: number): number => x * y;`;

    const nameNode = createNode('identifier', 'multiply');
    const paramsNode = createNode('formal_parameters', '(x: number, y: number)');
    const arrowFunc = createNode('arrow_function', '(x: number, y: number): number => x * y', [paramsNode]);
    const declarator = createNode('variable_declarator', 'multiply = ...', [nameNode, arrowFunc]);
    const declNode = createNode('lexical_declaration', sourceCode, [declarator]);
    const programNode = createNode('program', sourceCode, [declNode]);

    const tree = createTree(programNode, sourceCode);
    const result = extractor.extract(tree, 'src/math.ts');

    expect(result.symbols).toHaveLength(1);
    const sym = result.symbols[0]!;
    expect(sym.name).toBe('multiply');
    expect(sym.kind).toBe('function');
    expect(sym.signature).toBe('multiply(x: number, y: number)');
    expect(sym.modifiers).toContain('export');
    expect(result.exports).toContain('multiply');
  });

  it('extracts class declarations and their member methods', () => {
    const sourceCode = `export class UserService {
  public async findById(id: string): User {
    return null;
  }
}`;

    const classNameNode = createNode('type_identifier', 'UserService');
    const methodNameNode = createNode('property_identifier', 'findById');
    const methodParams = createNode('formal_parameters', '(id: string)');
    const methodNode = createNode('method_definition', 'public async findById(id: string): User', [
      methodNameNode,
      methodParams,
    ]);
    const classBodyNode = createNode('class_body', '{ ... }', [methodNode]);
    const classNode = createNode('class_declaration', sourceCode, [classNameNode, classBodyNode]);

    const programNode = createNode('program', sourceCode, [classNode]);
    const tree = createTree(programNode, sourceCode);

    const result = extractor.extract(tree, 'src/user.service.ts');

    expect(result.symbols).toHaveLength(2);
    const classSym = result.symbols.find((s) => s.kind === 'class')!;
    expect(classSym.name).toBe('UserService');
    expect(classSym.modifiers).toContain('export');

    const methodSym = result.symbols.find((s) => s.kind === 'method')!;
    expect(methodSym.name).toBe('UserService.findById');
    expect(methodSym.signature).toBe('findById(id: string)');
    expect(methodSym.modifiers).toContain('public');
    expect(methodSym.modifiers).toContain('async');
  });

  it('extracts interface, type alias, and enum declarations', () => {
    const sourceCode = `
export interface User { id: string; }
export type UserRole = 'admin' | 'user';
export enum UserStatus { ACTIVE, INACTIVE }
`;

    const interfaceNameNode = createNode('type_identifier', 'User');
    const interfaceNode = createNode('interface_declaration', 'export interface User { id: string; }', [interfaceNameNode]);

    const typeNameNode = createNode('type_identifier', 'UserRole');
    const typeAliasNode = createNode('type_alias_declaration', 'export type UserRole = ...', [typeNameNode]);

    const enumNameNode = createNode('identifier', 'UserStatus');
    const enumNode = createNode('enum_declaration', 'export enum UserStatus { ACTIVE, INACTIVE }', [enumNameNode]);

    const programNode = createNode('program', sourceCode, [interfaceNode, typeAliasNode, enumNode]);
    const tree = createTree(programNode, sourceCode);

    const result = extractor.extract(tree, 'src/types.ts');

    expect(result.symbols).toHaveLength(3);
    expect(result.symbols.find((s) => s.kind === 'interface')?.name).toBe('User');
    expect(result.symbols.find((s) => s.kind === 'type_alias')?.name).toBe('UserRole');
    expect(result.symbols.find((s) => s.kind === 'enum')?.name).toBe('UserStatus');
    expect(result.exports).toEqual(expect.arrayContaining(['User', 'UserRole', 'UserStatus']));
  });

  it('extracts named, default, relative, and wildcard import statements', () => {
    const sourceCode = `
import { ASTTree, SymbolNode } from '@repo-intel/shared';
import * as fs from 'node:fs';
import helper from './helper';
`;

    const spec1 = createNode('import_specifier', 'ASTTree', [createNode('identifier', 'ASTTree')]);
    const spec2 = createNode('import_specifier', 'SymbolNode', [createNode('identifier', 'SymbolNode')]);
    const str1 = createNode('string', "'@repo-intel/shared'");
    const import1 = createNode('import_statement', "import { ASTTree, SymbolNode } from '@repo-intel/shared';", [
      spec1,
      spec2,
      str1,
    ]);

    const str2 = createNode('string', "'node:fs'");
    const import2 = createNode('import_statement', "import * as fs from 'node:fs';", [str2]);

    const clause3 = createNode('import_clause', 'helper', [createNode('identifier', 'helper')]);
    const str3 = createNode('string', "'./helper'");
    const import3 = createNode('import_statement', "import helper from './helper';", [clause3, str3]);

    const programNode = createNode('program', sourceCode, [import1, import2, import3]);
    const tree = createTree(programNode, sourceCode);

    const result = extractor.extract(tree, 'src/index.ts');

    expect(result.imports).toHaveLength(3);

    const imp1 = result.imports.find((i) => i.sourcePath === '@repo-intel/shared')!;
    expect(imp1.importedSymbols).toEqual(['ASTTree', 'SymbolNode']);
    expect(imp1.isRelative).toBe(false);

    const imp2 = result.imports.find((i) => i.sourcePath === 'node:fs')!;
    expect(imp2.isWildcard).toBe(true);

    const imp3 = result.imports.find((i) => i.sourcePath === './helper')!;
    expect(imp3.importedSymbols).toEqual(['helper']);
    expect(imp3.isRelative).toBe(true);
  });

  it('handles empty AST trees gracefully without errors', () => {
    const tree: ASTTree = {
      rootNode: null as any,
      languageId: 'typescript',
      sourceCode: '',
      hasErrors: false,
      diagnostics: [],
    };

    const result = extractor.extract(tree, 'src/empty.ts');
    expect(result.symbols).toEqual([]);
    expect(result.imports).toEqual([]);
    expect(result.exports).toEqual([]);
    expect(result.loc).toBe(1);
  });
});
