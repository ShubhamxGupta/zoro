import fs from 'node:fs/promises';
import path from 'node:path';
import type { RepoBoundary } from './scanner.types.js';

const ROOT_MARKER_FILES = [
  '.git',
  'package.json',
  'go.mod',
  'Cargo.toml',
  'pyproject.toml',
  'pom.xml',
  'build.gradle',
];

export async function detectRepositoryRoot(startPath: string): Promise<RepoBoundary> {
  const absoluteStart = path.resolve(startPath);
  let currentDir = absoluteStart;

  while (true) {
    for (const marker of ROOT_MARKER_FILES) {
      const markerPath = path.join(currentDir, marker);
      try {
        await fs.access(markerPath);
        return {
          rootPath: currentDir,
          markerFound: marker,
          isGitRepo: marker === '.git' || (await pathExists(path.join(currentDir, '.git'))),
        };
      } catch {
        // Marker does not exist in current directory, try next
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached filesystem root without finding marker, return startPath as root
      return {
        rootPath: absoluteStart,
        markerFound: 'filesystem-root-fallback',
        isGitRepo: await pathExists(path.join(absoluteStart, '.git')),
      };
    }
    currentDir = parentDir;
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
