/**
 * Generates a globally unique, deterministic Symbol ID
 */
export function buildSymbolId(
  repoId: string,
  filePath: string,
  name: string,
  parentName?: string,
  signature?: string
): string {
  const container = parentName ? `${parentName}.` : '';
  const sigSuffix = signature ? `::${signature.replace(/\s+/g, '')}` : '';
  return `${repoId}::${filePath}::${container}${name}${sigSuffix}`;
}
