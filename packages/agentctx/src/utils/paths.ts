import { resolve } from "pathe";

export function toPosixPath(path: string): string {
  return path.replaceAll("\\", "/");
}

export function normalizeRepoPath(path: string): string {
  const normalized = toPosixPath(path).replace(/^\.\/+/, "");
  return normalized.length === 0 ? "." : normalized;
}

export function isPathInside(root: string, target: string): boolean {
  const resolvedRoot = resolve(root);
  const resolvedTarget = resolve(root, target);
  return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(`${resolvedRoot}/`);
}

export function artifactPathForContextPoint(id: string): string {
  return `.context/context-points/${id}.context.md`;
}
