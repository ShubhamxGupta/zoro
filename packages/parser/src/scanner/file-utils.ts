import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf',
  '.zip', '.tar', '.gz', '.7z', '.exe', '.dll', '.so', '.dylib',
  '.woff', '.woff2', '.ttf', '.eot', '.mp3', '.mp4', '.mov',
]);

export async function isBinaryFile(filePath: string): Promise<boolean> {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) {
    return true;
  }

  try {
    const handle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(8192);
    const { bytesRead } = await handle.read(buffer, 0, 8192, 0);
    await handle.close();

    if (bytesRead === 0) {
      return false;
    }

    // Check for null bytes (\0) in initial buffer chunk
    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function computeFileHash(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch {
    return '';
  }
}

export class SymlinkTracker {
  private visitedRealPaths = new Set<string>();

  public async isCycleOrOutside(targetPath: string, rootPath: string): Promise<boolean> {
    try {
      const realPath = await fs.realpath(targetPath);
      const relative = path.relative(rootPath, realPath);

      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        return true; // Pointing outside root directory
      }

      if (this.visitedRealPaths.has(realPath)) {
        return true; // Symlink loop / cycle detected
      }

      this.visitedRealPaths.add(realPath);
      return false;
    } catch {
      return true;
    }
  }
}
