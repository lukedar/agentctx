import type { EvaluationResult, ReviewScores } from "./types.js";

const scoreKeys: (keyof ReviewScores)[] = [
  "correctness",
  "performance",
  "tokenUsage",
  "security",
  "usability",
  "readability",
  "testability",
  "maintainability"
];

export function renderEvaluationReport(result: EvaluationResult): string {
  const scores = scoreKeys
    .map((key) => `- ${key}: ${result.scores[key]}`)
    .join("\n");
  const blockingIssues =
    result.blockingIssues.length > 0
      ? result.blockingIssues.map((issue) => `- ${issue}`).join("\n")
      : "- None";
  const requiredChanges =
    result.requiredChanges.length > 0
      ? result.requiredChanges.map((change) => `- ${change}`).join("\n")
      : "- None";

  return [
    "# Dual Agent Evaluation",
    "",
    `Status: ${result.status}`,
    "",
    "## Scores",
    "",
    scores,
    "",
    "## Blocking Issues",
    "",
    blockingIssues,
    "",
    "## Required Changes",
    "",
    requiredChanges,
    ""
  ].join("\n");
}
