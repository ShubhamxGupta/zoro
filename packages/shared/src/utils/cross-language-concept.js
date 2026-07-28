export function mapToNormalizedConcept(kind, signature) {
    switch (kind) {
        case 'class':
            return 'ClassLike';
        case 'interface':
            return 'InterfaceLike';
        case 'enum':
            return 'EnumLike';
        case 'function':
        case 'method':
            return 'FunctionLike';
        case 'module':
        case 'import':
        case 'export':
            return 'ModuleLike';
        case 'type_alias':
            return signature?.includes('interface') ? 'InterfaceLike' : 'ClassLike';
        default:
            return 'VariableLike';
    }
}
//# sourceMappingURL=cross-language-concept.js.map