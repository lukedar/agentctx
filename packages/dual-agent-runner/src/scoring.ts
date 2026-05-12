import type { ReviewScores, ReviewStatus } from "./types.js";

export function evaluateScores(scores: ReviewScores): ReviewStatus {
  const values = Object.values(scores);
  if (values.some((score) => score < 3)) {
    return "fail";
  }
  if (scores.security < 4 || scores.performance < 4 || scores.tokenUsage < 4) {
    return "revise";
  }
  const average = values.reduce((sum, score) => sum + score, 0) / values.length;
  return average < 4 ? "revise" : "pass";
}
