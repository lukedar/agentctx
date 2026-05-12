export type ReviewScores = {
  correctness: number;
  performance: number;
  tokenUsage: number;
  security: number;
  usability: number;
  readability: number;
  testability: number;
  maintainability: number;
};

export type ReviewStatus = "pass" | "revise" | "fail";

export type EvaluationResult = {
  status: ReviewStatus;
  scores: ReviewScores;
  blockingIssues: string[];
  requiredChanges: string[];
};
