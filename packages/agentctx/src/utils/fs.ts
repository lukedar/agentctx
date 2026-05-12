import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "pathe";
import type { ContextArtifact } from "../model/types.js";
import { isPathInside } from "./paths.js";

export async function writeArtifacts(input: {
  cwd: string;
  artifacts: ContextArtifact[];
  dryRun?: boolean;
}): Promise<void> {
  for (const artifact of input.artifacts) {
    if (!isPathInside(input.cwd, artifact.path)) {
      throw new Error(`Unsafe artifact path: ${artifact.path}`);
    }
    if (input.dryRun) {
      continue;
    }
    const target = resolve(input.cwd, artifact.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, artifact.content, "utf8");
  }
}
