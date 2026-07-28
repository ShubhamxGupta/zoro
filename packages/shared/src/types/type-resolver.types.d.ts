/**
 * Language-Independent Type Resolver Domain Contracts
 */
export interface TypeInfo {
    rawType: string;
    resolvedSymbolId?: string;
    isPrimitive: boolean;
    isGeneric: boolean;
    genericTypeArguments?: string[];
    isNullable?: boolean;
    isArray?: boolean;
}
export interface TypeResolver {
    resolveType(typeString: string, contextFilePath: string): Promise<TypeInfo>;
}
//# sourceMappingURL=type-resolver.types.d.ts.map