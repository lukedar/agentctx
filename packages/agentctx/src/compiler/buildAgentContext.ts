import type { ContextArtifact, OperationalContext } from "../model/types.js";
import { loadConfig } from "../config/loadConfig.js";
import { renderAgentsMdSurface } from "../surfaces/renderAgentsMd.js";
import { renderLlmsTxtSurface } from "../surfaces/renderLlmsTxt.js";
import { discoverRepository } from "./discover.js";
import { compileOperationalContext } from "./compile.js";
import { renderContextArtifacts } from "./render.js";

export type BuildAgentContextResult = {
  context: OperationalContext;
  artifacts: ContextArtifact[];
};

export async function buildAgentContext(input: {
  cwd: string;
}): Promise<BuildAgentContextResult> {
  const startedAt = Date.now();
  const config = await loadConfig({ cwd: input.cwd });
  const snapshot = await discoverRepository({ cwd: input.cwd });
  const context = compileOperationalContext({ snapshot, config, startedAt });
  const artifacts = [
    ...renderContextArtifacts(context),
    { path: "AGENTS.md", content: renderAgentsMdSurface() },
    { path: "llms.txt", content: renderLlmsTxtSurface() }
  ];
  context.metrics.artifactsWritten = artifacts.length;
  context.metrics.generatedCharacters = artifacts.reduce(
    (sum, artifact) => sum + artifact.content.length,
    0
  );
  context.metrics.estimatedTokens = Math.ceil(context.metrics.generatedCharacters / 4);
  const largest = [...artifacts].sort((a, b) => b.content.length - a.content.length)[0];
  if (largest) {
    context.metrics.largestArtifactPath = largest.path;
    context.metrics.largestArtifactCharacters = largest.content.length;
  }
  return { context, artifacts };
}
