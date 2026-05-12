import { checkArtifacts } from "../../validation/checkArtifacts.js";

export async function runCheck(options: { cwd: string }) {
  return checkArtifacts({ cwd: options.cwd });
}

export function renderCheckSuccess(result: Awaited<ReturnType<typeof runCheck>>): string {
  const warnings =
    result.warnings.length > 0
      ? result.warnings.map((warning) => `- ${warning}`).join("\n")
      : "- None";
  const usefulness = result.usefulness
    .map((score) => `- ${score.contextPointId}: ${score.score}/100`)
    .join("\n");

  return `AgentCtx check complete

Status: pass

Artifacts:
- manifest: pass
- graph: pass
- repo context: pass
- context points: pass
- task packet schema: pass

Agent usefulness:
${usefulness}

Warnings:
${warnings}
`;
}
