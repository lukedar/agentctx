import { describe, expect, it } from "vitest";
import { renderEvaluationReport, type EvaluationResult } from "../src/index.js";

describe("renderEvaluationReport", () => {
  it("renders deterministically", () => {
    const result: EvaluationResult = {
      status: "pass",
      scores: {
        correctness: 4,
        performance: 4,
        tokenUsage: 4,
        security: 4,
        usability: 4,
        readability: 4,
        testability: 4,
        maintainability: 4
      },
      blockingIssues: [],
      requiredChanges: []
    };

    expect(renderEvaluationReport(result)).toMatchInlineSnapshot(`
      "# Dual Agent Evaluation

      Status: pass

      ## Scores

      - correctness: 4
      - performance: 4
      - tokenUsage: 4
      - security: 4
      - usability: 4
      - readability: 4
      - testability: 4
      - maintainability: 4

      ## Blocking Issues

      - None

      ## Required Changes

      - None
      "
    `);
  });
});
