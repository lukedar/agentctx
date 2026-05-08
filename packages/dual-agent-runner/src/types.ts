export type RiskLevel = 'low' | 'medium' | 'high'

export type ReviewStatus = 'pass' | 'revise' | 'fail'

export type ScoreDimension =
  | 'correctness'
  | 'testability'
  | 'performance'
  | 'tokenUsage'
  | 'usability'
  | 'readability'
  | 'security'
  | 'simplicity'
  | 'maintainability'

export type ScoreValue = 0 | 1 | 2 | 3 | 4 | 5

export type ReviewScore = Readonly<Record<ScoreDimension, ScoreValue>>

export type RunnerTask = Readonly<{
  id: string
  title: string
  goal: string
  constraints: readonly string[]
  successCriteria: readonly string[]
  filesLikelyAffected: readonly string[]
  riskLevel: RiskLevel
}>

export type DecisionRecord = Readonly<{
  taskId: string
  decision: string
  reason: string
  filesAffected: readonly string[]
  alternativesConsidered: readonly string[]
  risks: readonly string[]
  expectedEffects: Readonly<{
    performance: string
    tokenUsage: string
    usability: string
    readability: string
    security: string
  }>
}>

export type EvaluationResult = Readonly<{
  taskId: string
  status: ReviewStatus
  scores: ReviewScore
  average: number
  blockingIssues: readonly string[]
  requiredChanges: readonly string[]
  approvedNextStep: string
}>
