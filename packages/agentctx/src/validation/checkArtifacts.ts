import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "pathe";
import type { ContextUsefulnessScore } from "../model/types.js";
import { containsSecretLikeValue } from "../security/redaction.js";
import { scoreContextPointContent } from "./usefulness.js";

export type ArtifactCheckResult = {
  ok: boolean;
  warnings: string[];
  errors: string[];
  usefulness: ContextUsefulnessScore[];
};

const requiredFiles = [
  ".context/manifest.yaml",
  ".context/graph.json",
  ".context/repo.context.md",
  ".context/templates/task-packet.schema.md"
];

export async function checkArtifacts(input: {
  cwd: string;
}): Promise<ArtifactCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const usefulness: ContextUsefulnessScore[] = [];

  for (const file of requiredFiles) {
    if (!existsSync(resolve(input.cwd, file))) {
      errors.push(`${file} is missing`);
    }
  }
  if (errors.length > 0) {
    return { ok: false, warnings, errors, usefulness };
  }

  const manifest = await readFile(resolve(input.cwd, ".context/manifest.yaml"), "utf8");
  const pointPaths = [...manifest.matchAll(/path: (\.context\/context-points\/[^\n]+)/g)]
    .map((match) => match[1])
    .filter((path): path is string => Boolean(path));

  if (pointPaths.length === 0) {
    errors.push("manifest does not reference any Context Point files");
  }

  const generatedFiles = [...requiredFiles, ...pointPaths, "AGENTS.md", "llms.txt"];
  for (const file of generatedFiles) {
    const fullPath = resolve(input.cwd, file);
    if (!existsSync(fullPath)) {
      errors.push(`${file} is missing`);
      continue;
    }
    const content = await readFile(fullPath, "utf8");
    if (containsSecretLikeValue(content)) {
      errors.push(`${file} contains an obvious secret-like value`);
    }
  }

  const graph = JSON.parse(await readFile(resolve(input.cwd, ".context/graph.json"), "utf8")) as {
    nodes?: { artifact?: string; confidence?: string }[];
    commands?: unknown[];
    edges?: unknown[];
  };
  for (const node of graph.nodes ?? []) {
    if (!node.artifact || !existsSync(resolve(input.cwd, node.artifact))) {
      errors.push(`graph node references missing artifact path: ${node.artifact ?? "unknown"}`);
    }
    if (node.confidence === "low") {
      warnings.push("Context Point confidence is low");
    }
  }
  if (!graph.commands || graph.commands.length === 0) {
    warnings.push("no validation commands found");
  }
  if (!graph.edges || graph.edges.length === 0) {
    warnings.push("no interfaces detected");
  }

  for (const path of pointPaths) {
    const content = await readFile(resolve(input.cwd, path), "utf8");
    for (const section of ["Start Here", "Scope", "Done When", "Evidence"]) {
      if (!content.includes(`## ${section}`)) {
        errors.push(`${path} is missing ${section}`);
      }
    }
    const id = path.replace(".context/context-points/", "").replace(".context.md", "");
    const score = scoreContextPointContent({ id, content });
    usefulness.push(score);
    if (score.score < 70) {
      errors.push(`${id} usefulness score is below 70`);
    } else if (score.score < 85) {
      warnings.push(`${id} usefulness score is ${score.score}/100`);
    }
  }

  const hasTestCommand = (graph.commands ?? []).some((command) => {
    if (!command || typeof command !== "object") {
      return false;
    }
    const value = command as { purpose?: unknown; command?: unknown };
    return value.purpose === "Run tests" || String(value.command ?? "").includes(" test");
  });
  if (!hasTestCommand) {
    warnings.push("no tests detected");
  }

  return { ok: errors.length === 0, warnings, errors, usefulness };
}
