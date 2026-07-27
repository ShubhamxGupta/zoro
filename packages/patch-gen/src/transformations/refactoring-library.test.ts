import { describe, it, expect } from 'vitest';
import {
  AddDocumentationTransformation,
  InsertImportTransformation,
  RemoveImportTransformation,
  RenameSymbolTransformation,
} from './refactoring-library.js';

describe('Refactoring Library', () => {
  it('executes RenameSymbolTransformation', async () => {
    const transform = new RenameSymbolTransformation();
    const res = await transform.apply('function getUser() {}', 'getUser', { newName: 'fetchUser' });
    expect(res.transformedCode).toBe('function fetchUser() {}');
  });

  it('executes InsertImportTransformation', async () => {
    const transform = new InsertImportTransformation();
    const res = await transform.apply('const x = 1;', 'UserService', { importPath: './user.js' });
    expect(res.transformedCode).toContain("import { UserService } from './user.js';");
  });

  it('executes RemoveImportTransformation', async () => {
    const transform = new RemoveImportTransformation();
    const source = "import { UserService } from './user.js';\nconst x = 1;";
    const res = await transform.apply(source, 'UserService');
    expect(res.transformedCode).toBe('const x = 1;');
  });

  it('executes AddDocumentationTransformation', async () => {
    const transform = new AddDocumentationTransformation();
    const res = await transform.apply('function save() {}', 'save');
    expect(res.transformedCode).toContain('/** Documented save */');
  });
});
