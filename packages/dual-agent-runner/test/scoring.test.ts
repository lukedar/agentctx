import { describe, expect, it } from "vitest";
import { evaluateScores, type ReviewScores } from "../src/index.js";

const base: ReviewScores = {
  correctness: 4,
  performance: 4,
  tokenUsage: 4,
  security: 4,
  usability: 4,
  readability: 4,
  testability: 4,
  maintainability: 4
};

describe("evaluateScores", () => {
  it("passes when all scores are at least 4", () => {
    expect(evaluateScores(base)).toBe("pass");
  });

  it("fails when any score is below 3", () => {
    expect(evaluateScores({ ...base, usability: 2 })).toBe("fail");
  });

  it("revises when security is 3", () => {
    expect(evaluateScores({ ...base, security: 3 })).toBe("revise");
  });

  it("revises when performance is 3", () => {
    expect(evaluateScores({ ...base, performance: 3 })).toBe("revise");
  });

  it("revises when token usage is 3", () => {
    expect(evaluateScores({ ...base, tokenUsage: 3 })).toBe("revise");
  });

  it("revises when average score is below 4", () => {
    expect(evaluateScores({ ...base, correctness: 3, usability: 3 })).toBe(
      "revise"
    );
  });
});
