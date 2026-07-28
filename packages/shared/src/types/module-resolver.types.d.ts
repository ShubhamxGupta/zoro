/**
 * Language-Independent Module Resolver Domain Contracts
 */
import type { ImportStatement } from './ast.types.js';
export interface ResolvedModule {
    sourcePath: string;
    resolvedFilePath?: string;
    resolvedModuleId: string;
    isExternal: boolean;
    isRelative: boolean;
    namespace?: string;
}
export interface ModuleResolver {
    resolveModule(importStatement: ImportStatement, currentFilePath: string, availableFiles: string[]): Promise<ResolvedModule>;
}
//# sourceMappingURL=module-resolver.types.d.ts.map