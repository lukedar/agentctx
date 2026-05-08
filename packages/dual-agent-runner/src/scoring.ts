import type { EvaluationResult, ReviewScore, ReviewStatus } from './types'

export const calculateAverageScore = (scores: ReviewScore): number => {
  const values = Object.values(scores)
  const sum = values.reduce((acc: number, v) => acc + v, 0)
  return values.length === 0 ? 0 : sum / values.length
}

export const evaluateScores = (scores: ReviewScore): ReviewStatus => {
  const values = Object.values(scores)
  const average = calculateAverageScore(scores)

  // Hard fail rule: any dimension below 3.
  if (values.some((score) => score < 3)) return 'fail'

  // Mandatory revision rules.
  if (scores.security < 4) return 'revise'
  if (scores.tokenUsage < 4) return 'revise'

  // General quality bar.
  if (average < 4) return 'revise'

  return 'pass'
}

export const createEvaluationResult = (input: {
  taskId: string
  scores: ReviewScore
  blockingIssues: readonly string[]
  requiredChanges: readonly string[]
  approvedNextStep: string
}): EvaluationResult => {
  const average = calculateAverageScore(input.scores)

  return {
    taskId: input.taskId,
    status: evaluateScores(input.scores),
    scores: input.scores,
    average,
    blockingIssues: input.blockingIssues,
    requiredChanges: input.requiredChanges,
    approvedNextStep: input.approvedNextStep,
  }
}

export const isPassingReview = (result: EvaluationResult): boolean => result.status === 'pass'
