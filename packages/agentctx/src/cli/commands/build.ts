import { buildAgentContext } from "../../compiler/buildAgentContext.js";
import { writeArtifacts } from "../../utils/fs.js";

export type BuildOptions = {
  cwd: string;
  dryRun?: boolean;
};

export async function runBuild(options: BuildOptions) {
  const result = await buildAgentContext({ cwd: options.cwd });
  await writeArtifacts({
    cwd: options.cwd,
    artifacts: result.artifacts,
    ...(options.dryRun === undefined ? {} : { dryRun: options.dryRun })
  });
  return result;
}

export function renderBuildSuccess(result: Awaited<ReturnType<typeof runBuild>>): string {
  const contextPointArtifact =
    result.context.contextPoints[0]?.id === undefined
      ? ".context/context-points/<id>.context.md"
      : `.context/context-points/${result.context.contextPoints[0].id}.context.md`;
  const total = result.context.contextPoints.length;
  const withStartHere = result.context.contextPoints.filter(
    (point) => point.startHere.length > 0
  ).length;
  const withValidation = result.context.contextPoints.filter(
    (point) => point.commands.length > 0 || point.unknowns.length > 0
  ).length;
  const withEvidence = result.context.contextPoints.filter(
    (point) => point.evidence.length > 0
  ).length;

  return `AgentCtx build complete

Artifacts:
- .context/manifest.yaml
- .context/graph.json
- .context/repo.context.md
- ${contextPointArtifact}
- .context/templates/task-packet.schema.md

Surfaces:
- AGENTS.md
- llms.txt

Performance:
- Duration: ${result.context.metrics.durationMs}ms
- Files scanned: ${result.context.metrics.filesScanned}
- Files skipped: ${result.context.metrics.filesSkipped}
- Context Points: ${total}

Token usage:
- Generated characters: ${result.context.metrics.generatedCharacters}
- Estimated tokens: ${result.context.metrics.estimatedTokens}
- Largest artifact: ${result.context.metrics.largestArtifactPath ?? "unknown"}

Agent usefulness:
- Context Points with Start Here: ${withStartHere}/${total}
- Context Points with validation guidance: ${withValidation}/${total}
- Context Points with evidence: ${withEvidence}/${total}
`;
}
