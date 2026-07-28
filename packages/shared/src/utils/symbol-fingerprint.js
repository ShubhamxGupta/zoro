/**
 * Generates a deterministic semantic fingerprint string for a symbol
 */
export function generateSymbolFingerprint(symbol) {
    const parts = [
        symbol.kind ?? 'unknown',
        symbol.name ?? '',
        symbol.signature ? symbol.signature.replace(/\s+/g, '') : '',
        symbol.modifiers ? symbol.modifiers.sort().join(',') : '',
        symbol.docModel?.summary ? symbol.docModel.summary.trim() : '',
    ];
    const raw = parts.join('||');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    return `fp::${symbol.kind}::${hexHash}`;
}
//# sourceMappingURL=symbol-fingerprint.js.map