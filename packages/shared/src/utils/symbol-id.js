/**
 * Generates a globally unique, deterministic Symbol ID
 */
export function buildSymbolId(repoId, filePath, name, parentName, signature) {
    const container = parentName ? `${parentName}.` : '';
    const sigSuffix = signature ? `::${signature.replace(/\s+/g, '')}` : '';
    return `${repoId}::${filePath}::${container}${name}${sigSuffix}`;
}
//# sourceMappingURL=symbol-id.js.map