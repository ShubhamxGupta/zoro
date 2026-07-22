import fs from 'node:fs/promises';
import type { LanguageId } from '@repo-intel/shared';

export async function detectLanguageByShebang(filePath: string): Promise<LanguageId | null> {
  try {
    const handle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(256);
    const { bytesRead } = await handle.read(buffer, 0, 256, 0);
    await handle.close();

    if (bytesRead < 3) return null;

    const firstLine = buffer.toString('utf-8', 0, bytesRead).split('\n')[0]?.trim();
    if (!firstLine || !firstLine.startsWith('#!')) {
      return null;
    }

    const lower = firstLine.toLowerCase();
    if (lower.includes('node') || lower.includes('deno') || lower.includes('bun')) {
      return 'javascript';
    }
    if (lower.includes('python')) {
      return 'python';
    }
    return null;
  } catch {
    return null;
  }
}
