export type BenchmarkCondition = 'no-context' | 'agentctx-context'
export type BenchmarkStatus = 'pending' | 'completed' | 'failed' | 'inconclusive'
export type BenchmarkOutcome = 'helped' | 'hurt' | 'neutral' | 'inconclusive'

export type BenchmarkDefinition = Readonly<{
  version: 1
  repo: string
  ctxPoint: string
  ctxBlock: string
  taskName: string
  taskId: string
  taskPrompt: string
  contextFile: string
  conditions: readonly BenchmarkCondition[]
  prompts: Readonly<Record<BenchmarkCondition, string>>
  results: Readonly<Record<BenchmarkCondition, string>>
}>

export type AgentComputeMetrics = Readonly<{
  model?: string
  retries: number
  toolCalls: number
  reasoningEffort?: string
  providerLatencyMs?: number
}>

export type BenchmarkConditionResult = Readonly<{
  condition: BenchmarkCondition
  status: BenchmarkStatus
  elapsedMs: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  agentCompute: AgentComputeMetrics
  changedFiles: readonly string[]
  checksPassed: boolean
  validationNotes: readonly string[]
  evaluatorScore: number
  scopeMisses: readonly string[]
}>

export type BenchmarkComparison = Readonly<{
  outcome: BenchmarkOutcome
  speedDeltaMs: number
  tokenDelta: number
  computeDelta: Readonly<{
    retries: number
    toolCalls: number
    providerLatencyMs?: number
  }>
  evaluatorScoreDelta: number
  rationale: string
}>

export type TokenSummary = Readonly<{
  noContextTotal: number
  agentctxContextTotal: number
  delta: number
  reductionPercent: number
}>

export type CoverageStatus = 'covered' | 'partial' | 'missing'

export type ContextPointCoverage = Readonly<{
  contextPoint: string
  changedFiles: readonly string[]
  testFiles: readonly string[]
  status: CoverageStatus
}>

export type TestCoverageSummary = Readonly<{
  totalContextPoints: number
  coveredContextPoints: number
  partialContextPoints: number
  missingContextPoints: number
}>

export type BenchmarkMetricStatus = 'green' | 'yellow' | 'red'

export type BenchmarkTaskDefinition = Readonly<{
  id: string
  title: string
  goal: string
  background: string
  requiredChanges: readonly string[]
  expectedFiles: readonly string[]
  forbiddenFiles: readonly string[]
  requiredCommands: readonly string[]
  successCriteria: readonly string[]
  contextPoints: readonly string[]
  difficulty: 'small' | 'medium' | 'large' | 'complex' | 'very-large'
  benchmarkRepo: string
  expectedEffort: string
  tags: readonly string[]
  prompt: string
}>

export type OperationalScopeMetrics = Readonly<{
  benchmarkRepo: string
  complexity: BenchmarkTaskDefinition['difficulty']
  expectedEffort: string
  requiredContextPoints: readonly string[]
  noContextLoadedContextPoints: readonly string[]
  agentctxLoadedContextPoints: readonly string[]
  excludedContextPoints: readonly string[]
  contextPrecisionPercent: number
  contextRecallPercent: number
  contextWastePercent: number
  contextPrecisionDeltaPercent: number
}>

export type BenchmarkAnalyticalMetrics = Readonly<{
  tokenReductionPercent: number
  runtimeReductionPercent: number
  performanceImprovementPercent: number
  successRatePercent: number
  irrelevantEditReductionPercent: number
  status: BenchmarkMetricStatus
}>

export type BenchmarkReport = Readonly<{
  benchmark: BenchmarkDefinition
  noContext: BenchmarkConditionResult
  agentctxContext: BenchmarkConditionResult
  comparison: BenchmarkComparison
  tokenSummary: TokenSummary
  operationalScope: OperationalScopeMetrics
  metrics: BenchmarkAnalyticalMetrics
  coverageByContextPoint: readonly ContextPointCoverage[]
  testCoverageSummary: TestCoverageSummary
  securityFindings: readonly string[]
  publicSafeValidation: Readonly<{
    checked: boolean
    passed: boolean
    excludedFactCount: number
    notes: readonly string[]
  }>
}>

export type BenchmarkSuiteDefinition = Readonly<{
  title: string
  purpose: string
  tasks: readonly string[]
  conditions: readonly BenchmarkCondition[]
  requiredReports: readonly string[]
  successCriteria: readonly string[]
}>

export type BenchmarkRunPlan = Readonly<{
  taskId: string
  taskName: string
  difficulty: BenchmarkTaskDefinition['difficulty']
  conditions: readonly BenchmarkCondition[]
  contextPoints: readonly string[]
  requiredCommands: readonly string[]
  expectedFiles: readonly string[]
  forbiddenFiles: readonly string[]
}>

export type RunBenchmarkTasksResult = Readonly<{
  reportIndexPath: string
  reports: readonly BenchmarkReport[]
}>

export type PrepareBenchmarkInput = Readonly<{
  repoDir: string
  ctxPoint?: string
  ctxBlock: string
  ctxFile?: string
  taskName: string
  taskPrompt: string
  outDir?: string
  publishResults?: boolean
}>

export type PreparedBenchmark = Readonly<{
  runDir: string
  benchmark: BenchmarkDefinition
}>

export type BenchmarkResultsIndex = Readonly<{
  version: 1
  results: readonly BenchmarkReport[]
}>
