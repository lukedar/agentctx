import type { ContextUsefulnessScore } from "../model/types.js";

export function scoreContextPointContent(input: {
  id: string;
  content: string;
}): ContextUsefulnessScore {
  const hasPurpose = sectionHasContent(input.content, "Purpose");
  const hasScope =
    input.content.includes("## Scope") &&
    input.content.includes("### Owns") &&
    input.content.includes("### Does Not Own");
  const startHereSection = extractSection(input.content, "Start Here");
  const hasStartHere =
    startHereSection.includes("| Path | Why It Matters | Common Task |") &&
    !startHereSection.includes("| None | None | None |");
  const hasCommandsOrUnknowns =
    input.content.includes("## Commands") &&
    (input.content.includes("pnpm ") || input.content.includes("Unknown"));
  const hasDoneWhen = input.content.includes("## Done When");
  const hasEvidence =
    input.content.includes("## Evidence") &&
    input.content.includes("| Claim | Repository Evidence |");

  return {
    contextPointId: input.id,
    score:
      (hasPurpose ? 15 : 0) +
      (hasScope ? 20 : 0) +
      (hasStartHere ? 20 : 0) +
      (hasCommandsOrUnknowns ? 15 : 0) +
      (hasDoneWhen ? 15 : 0) +
      (hasEvidence ? 15 : 0),
    checks: {
      hasPurpose,
      hasScope,
      hasStartHere,
      hasCommandsOrUnknowns,
      hasDoneWhen,
      hasEvidence
    }
  };
}

function sectionHasContent(content: string, section: string): boolean {
  return Boolean(extractSection(content, section).trim());
}

function extractSection(content: string, section: string): string {
  const pattern = new RegExp(`## ${section}\\n\\n([\\s\\S]*?)(?=\\n## |$)`, "m");
  const match = pattern.exec(content);
  return match?.[1] ?? "";
}
