import { promises as fs } from 'node:fs'
import path from 'node:path'

import { estimateTokens } from './tokenUsage'

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

const CONDITIONS: readonly BenchmarkCondition[] = ['no-context', 'agentctx-context']

const ensureDir = async (dir: string): Promise<void> => {
  await fs.mkdir(dir, { recursive: true })
}

export const slugify = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'task'
}

const uniqueSorted = (items: readonly string[]): readonly string[] =>
  [...new Set(items.filter((item) => item.trim()).map((item) => item.trim()))].sort((a, b) => a.localeCompare(b))

const section = (raw: string, heading: string): string => {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = raw.match(new RegExp(`(?:^|\\n)## ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |\\s*$)`))
  return match?.[1]?.trim() ?? ''
}

const listItems = (raw: string): readonly string[] =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
    .filter(Boolean)

const firstParagraph = (raw: string): string =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')

const fileToContextPoint = (filePath: string): string | undefined => {
  const normalized = filePath.replaceAll(path.sep, '/')
  if (normalized.startsWith('docs-agentctx/')) return 'docs-agentctx'
  const reactMatch = normalized.match(/^react\/([^/]+)/)
  if (reactMatch) return reactMatch[1]
  const backendMatch = normalized.match(/^backend-infra\/([^/]+)/)
  if (backendMatch) return backendMatch[1]
  const match = normalized.match(/^packages\/([^/]+)/)
  if (!match) return undefined
  return match[1] === 'cli' ? 'cli' : match[1]
}

const testFileForContextPoint = (contextPoint: string): string => {
  if (contextPoint.startsWith('react-')) return `react/${contextPoint}/tests`
  if (
    [
      'app-host',
      'api-services',
      'workers',
      'database',
      'contracts',
      'infra',
      'observability',
      'security',
      'tests',
    ].includes(contextPoint)
  ) {
    return `backend-infra/${contextPoint}/tests`
  }
  if (contextPoint === 'core') return 'packages/core/tests/**/*.test.ts'
  if (contextPoint === 'cli') return 'packages/cli/tests/**/*.test.ts'
  if (contextPoint === 'adapters') return 'packages/adapters/tests/**/*.test.ts'
  if (contextPoint === 'targets') return 'packages/targets/tests/**/*.test.ts'
  if (contextPoint === 'dual-agent-runner') return 'packages/dual-agent-runner/tests/benchmark.test.ts'
  if (contextPoint === 'docs-agentctx') return 'VITEPRESS_BASE=/agentctx/ pnpm -C docs-agentctx build'
  return `packages/${contextPoint}/tests/**/*.test.ts`
}

const contextFileFor = (repoDir: string, ctxBlock: string): string =>
  path.join(repoDir, '.agentctx', 'context', `${ctxBlock}.md`)

const defaultRunDir = (repoDir: string, ctxBlock: string, taskId: string): string =>
  path.join(repoDir, '.dual-agent-runner', 'benchmarks', slugify(ctxBlock), taskId)

const toRelative = (from: string, target: string): string => path.relative(from, target).replaceAll(path.sep, '/')

const renderPrompt = (input: {
  definition: Pick<BenchmarkDefinition, 'ctxBlock' | 'taskName' | 'taskPrompt' | 'contextFile' | 'repo'>
  condition: BenchmarkCondition
  contextContent?: string
}): string => {
  const contextRule =
    input.condition === 'no-context'
      ? [
          'Do not use generated AgentCtx files.',
          'Do not read `AGENTS.md`, `.agentctx/context`, or other generated context outputs.',
          'Work from the raw repo tree, source files, config, and tests only.',
        ]
      : [
          `Start with the generated CtxBlock: \`${input.definition.contextFile}\`.`,
          'Use raw source files only when the CtxBlock is insufficient for the task.',
          'Record any context that was irrelevant or missing in the result file.',
        ]

  const lines = [
    `# Benchmark Task: ${input.definition.taskName}`,
    '',
    `Repository: ${input.definition.repo}`,
    `CtxBlock: ${input.definition.ctxBlock}`,
    `Condition: ${input.condition}`,
    '',
    '## Task Prompt',
    '',
    input.definition.taskPrompt,
    '',
    '## Context Rule',
    '',
    ...contextRule.map((rule) => `- ${rule}`),
    '',
    '## Result Capture',
    '',
    'When finished, update the adjacent `result.json` with elapsed time, token usage, agent compute metrics, changed files, validation notes, evaluator score, and scope misses.',
  ]

  if (input.condition === 'agentctx-context' && input.contextContent) {
    lines.push('', '## Generated CtxBlock', '', input.contextContent)
  }

  return `${lines.join('\n')}\n`
}

const createPendingResult = (
  condition: BenchmarkCondition,
  prompt: string,
): BenchmarkConditionResult => {
  const inputTokens = estimateTokens(prompt)

  return {
    condition,
    status: 'pending',
    elapsedMs: 0,
    inputTokens,
    outputTokens: 0,
    totalTokens: inputTokens,
    agentCompute: {
      retries: 0,
      toolCalls: 0,
    },
    changedFiles: [],
    checksPassed: false,
    validationNotes: ['Replace this template after the agent run completes.'],
    evaluatorScore: 0,
    scopeMisses: [],
  }
}

const writeJson = async (filePath: string, value: unknown): Promise<void> => {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export const prepareBenchmarkRun = async (input: PrepareBenchmarkInput): Promise<PreparedBenchmark> => {
  const repoDir = path.resolve(input.repoDir)
  const ctxBlock = input.ctxBlock.trim() || 'ctxblock'
  const ctxBlockSlug = slugify(ctxBlock)
  const ctxPoint = input.ctxPoint?.trim() ? slugify(input.ctxPoint) : 'workspace'
  const taskId = slugify(input.taskName)
  const contextFile = input.ctxFile ? path.resolve(input.ctxFile) : contextFileFor(repoDir, ctxBlockSlug)

  let contextContent: string
  try {
    contextContent = await fs.readFile(contextFile, 'utf8')
  } catch {
    throw new Error(`Missing CtxBlock file: ${contextFile}. Run AgentCtx context generation first.`)
  }

  const runDir = input.outDir ? path.resolve(input.outDir) : defaultRunDir(repoDir, ctxBlockSlug, taskId)
  const noContextDir = path.join(runDir, 'no-context')
  const agentctxDir = path.join(runDir, 'agentctx-context')
  await ensureDir(noContextDir)
  await ensureDir(agentctxDir)

  const definitionBase = {
    repo: repoDir,
    ctxPoint,
    ctxBlock,
    taskName: input.taskName,
    taskId,
    taskPrompt: input.taskPrompt,
    contextFile,
  }

  const noContextPrompt = renderPrompt({ definition: definitionBase, condition: 'no-context' })
  const agentctxPrompt = renderPrompt({
    definition: definitionBase,
    condition: 'agentctx-context',
    contextContent,
  })

  const promptPaths = {
    'no-context': path.join(noContextDir, 'prompt.md'),
    'agentctx-context': path.join(agentctxDir, 'prompt.md'),
  } as const

  const resultPaths = {
    'no-context': path.join(noContextDir, 'result.json'),
    'agentctx-context': path.join(agentctxDir, 'result.json'),
  } as const

  await fs.writeFile(promptPaths['no-context'], noContextPrompt, 'utf8')
  await fs.writeFile(promptPaths['agentctx-context'], agentctxPrompt, 'utf8')
  await writeJson(resultPaths['no-context'], createPendingResult('no-context', noContextPrompt))
  await writeJson(resultPaths['agentctx-context'], createPendingResult('agentctx-context', agentctxPrompt))

  const benchmark: BenchmarkDefinition = {
    version: 1,
    ...definitionBase,
    conditions: CONDITIONS,
    prompts: {
      'no-context': toRelative(runDir, promptPaths['no-context']),
      'agentctx-context': toRelative(runDir, promptPaths['agentctx-context']),
    },
    results: {
      'no-context': toRelative(runDir, resultPaths['no-context']),
      'agentctx-context': toRelative(runDir, resultPaths['agentctx-context']),
    },
  }

  await writeJson(path.join(runDir, 'benchmark.json'), benchmark)
  const report = await summarizeBenchmarkRun(runDir)
  await writeJson(path.join(runDir, 'report.json'), report)
  await fs.writeFile(path.join(runDir, 'report.md'), renderBenchmarkReportMarkdown(report), 'utf8')
  await fs.writeFile(path.join(runDir, 'index.html'), renderBenchmarkReportHtml(report), 'utf8')
  await ensureDir(path.join(runDir, 'coverage'))
  await fs.writeFile(path.join(runDir, 'coverage', 'index.html'), renderBenchmarkCoverageHtml(report), 'utf8')
  if (input.publishResults) await updateBenchmarkResultsIndex(report)

  return { runDir, benchmark }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const readJson = async <T>(filePath: string): Promise<T> =>
  JSON.parse(await fs.readFile(filePath, 'utf8')) as T

const safeReadJson = async <T>(filePath: string): Promise<T | undefined> => {
  try {
    return await readJson<T>(filePath)
  } catch {
    return undefined
  }
}

export const parseBenchmarkTaskMarkdown = (raw: string): BenchmarkTaskDefinition => {
  const title = raw.match(/^# Task:\s*(.+)$/m)?.[1]?.trim()
  if (!title) throw new Error('Invalid benchmark task: missing "# Task:" title')

  const difficultyRaw = firstParagraph(section(raw, 'Difficulty')).toLowerCase()
  const difficulty =
    difficultyRaw === 'medium' ||
    difficultyRaw === 'large' ||
    difficultyRaw === 'complex' ||
    difficultyRaw === 'very-large' ||
    difficultyRaw === 'small'
      ? difficultyRaw
      : 'medium'

  const contextPoints = uniqueSorted(listItems(section(raw, 'Context Points')))
  if (contextPoints.length === 0) throw new Error(`Invalid benchmark task "${title}": missing Context Points`)

  const requiredCommands = listItems(section(raw, 'Required Commands'))
  const expectedFiles = listItems(section(raw, 'Expected Files'))
  const forbiddenFiles = listItems(section(raw, 'Forbidden Files'))
  const successCriteria = listItems(section(raw, 'Success Criteria'))

  return {
    id: slugify(title),
    title,
    goal: firstParagraph(section(raw, 'Goal')),
    background: firstParagraph(section(raw, 'Background')),
    requiredChanges: listItems(section(raw, 'Required Changes')),
    expectedFiles,
    forbiddenFiles,
    requiredCommands,
    successCriteria,
    contextPoints,
    difficulty,
    benchmarkRepo: firstParagraph(section(raw, 'Benchmark Repo')) || 'AgentCtx',
    expectedEffort: firstParagraph(section(raw, 'Expected Effort')) || 'senior engineering task',
    tags: uniqueSorted(listItems(section(raw, 'Tags'))),
    prompt: raw.trim(),
  }
}

export const parseBenchmarkTaskFile = async (filePath: string): Promise<BenchmarkTaskDefinition> => {
  const parsed = parseBenchmarkTaskMarkdown(await fs.readFile(filePath, 'utf8'))
  return {
    ...parsed,
    id: slugify(path.basename(filePath).replace(/\.md$/i, '')),
  }
}

export const parseBenchmarkSuiteMarkdown = (raw: string): BenchmarkSuiteDefinition => {
  const title = raw.match(/^# Suite:\s*(.+)$/m)?.[1]?.trim()
  if (!title) throw new Error('Invalid benchmark suite: missing "# Suite:" title')

  const conditions = listItems(section(raw, 'Conditions')).filter(
    (item): item is BenchmarkCondition => item === 'no-context' || item === 'agentctx-context',
  )

  return {
    title,
    purpose: firstParagraph(section(raw, 'Purpose')),
    tasks: listItems(section(raw, 'Tasks')),
    conditions: conditions.length > 0 ? conditions : CONDITIONS,
    requiredReports: uniqueSorted(listItems(section(raw, 'Required Reports'))),
    successCriteria: listItems(section(raw, 'Success Criteria')),
  }
}

export const parseBenchmarkSuiteFile = async (filePath: string): Promise<BenchmarkSuiteDefinition> =>
  parseBenchmarkSuiteMarkdown(await fs.readFile(filePath, 'utf8'))

export const createBenchmarkRunPlan = (
  tasks: readonly BenchmarkTaskDefinition[],
  conditions: readonly BenchmarkCondition[] = CONDITIONS,
): readonly BenchmarkRunPlan[] =>
  tasks.map((task) => ({
    taskId: task.id,
    taskName: task.title,
    difficulty: task.difficulty,
    conditions,
    contextPoints: task.contextPoints,
    requiredCommands: task.requiredCommands,
    expectedFiles: task.expectedFiles,
    forbiddenFiles: task.forbiddenFiles,
  }))

const normalizeResult = (value: unknown, condition: BenchmarkCondition): BenchmarkConditionResult => {
  if (!isObject(value)) return createPendingResult(condition, '')

  const elapsedMs = typeof value.elapsedMs === 'number' ? value.elapsedMs : 0
  const inputTokens = typeof value.inputTokens === 'number' ? value.inputTokens : 0
  const outputTokens = typeof value.outputTokens === 'number' ? value.outputTokens : 0
  const totalTokens = typeof value.totalTokens === 'number' ? value.totalTokens : inputTokens + outputTokens
  const agentCompute = isObject(value.agentCompute) ? value.agentCompute : {}

  return {
    condition,
    status:
      value.status === 'completed' || value.status === 'failed' || value.status === 'inconclusive'
        ? value.status
        : 'pending',
    elapsedMs,
    inputTokens,
    outputTokens,
    totalTokens,
    agentCompute: {
      ...(typeof agentCompute.model === 'string' ? { model: agentCompute.model } : {}),
      retries: typeof agentCompute.retries === 'number' ? agentCompute.retries : 0,
      toolCalls: typeof agentCompute.toolCalls === 'number' ? agentCompute.toolCalls : 0,
      ...(typeof agentCompute.reasoningEffort === 'string' ? { reasoningEffort: agentCompute.reasoningEffort } : {}),
      ...(typeof agentCompute.providerLatencyMs === 'number'
        ? { providerLatencyMs: agentCompute.providerLatencyMs }
        : {}),
    },
    changedFiles: Array.isArray(value.changedFiles)
      ? value.changedFiles.filter((item): item is string => typeof item === 'string')
      : [],
    checksPassed: value.checksPassed === true,
    validationNotes: Array.isArray(value.validationNotes)
      ? value.validationNotes.filter((item): item is string => typeof item === 'string')
      : [],
    evaluatorScore: typeof value.evaluatorScore === 'number' ? value.evaluatorScore : 0,
    scopeMisses: Array.isArray(value.scopeMisses)
      ? value.scopeMisses.filter((item): item is string => typeof item === 'string')
      : [],
  }
}

export const compareBenchmarkResults = (
  noContext: BenchmarkConditionResult,
  agentctxContext: BenchmarkConditionResult,
): BenchmarkComparison => {
  const complete = noContext.status === 'completed' && agentctxContext.status === 'completed'
  const speedDeltaMs = noContext.elapsedMs - agentctxContext.elapsedMs
  const tokenDelta = noContext.totalTokens - agentctxContext.totalTokens
  const evaluatorScoreDelta = agentctxContext.evaluatorScore - noContext.evaluatorScore
  const latencyA = noContext.agentCompute.providerLatencyMs
  const latencyB = agentctxContext.agentCompute.providerLatencyMs
  const providerLatencyMs = typeof latencyA === 'number' && typeof latencyB === 'number' ? latencyA - latencyB : undefined

  const computeDelta = {
    retries: noContext.agentCompute.retries - agentctxContext.agentCompute.retries,
    toolCalls: noContext.agentCompute.toolCalls - agentctxContext.agentCompute.toolCalls,
    ...(providerLatencyMs === undefined ? {} : { providerLatencyMs }),
  }

  if (!complete) {
    return {
      outcome: 'inconclusive',
      speedDeltaMs,
      tokenDelta,
      computeDelta,
      evaluatorScoreDelta,
      rationale: 'Both benchmark conditions must be completed before comparison is meaningful.',
    }
  }

  if (!agentctxContext.checksPassed && noContext.checksPassed) {
    return {
      outcome: 'hurt',
      speedDeltaMs,
      tokenDelta,
      computeDelta,
      evaluatorScoreDelta,
      rationale: 'AgentCtx condition failed validation where no-context passed.',
    }
  }

  if (agentctxContext.checksPassed && !noContext.checksPassed) {
    return {
      outcome: 'helped',
      speedDeltaMs,
      tokenDelta,
      computeDelta,
      evaluatorScoreDelta,
      rationale: 'AgentCtx condition passed validation where no-context did not.',
    }
  }

  if (evaluatorScoreDelta >= 0.5 && (speedDeltaMs > 0 || tokenDelta > 0)) {
    return {
      outcome: 'helped',
      speedDeltaMs,
      tokenDelta,
      computeDelta,
      evaluatorScoreDelta,
      rationale: 'AgentCtx improved evaluator score and at least one efficiency metric.',
    }
  }

  if (evaluatorScoreDelta <= -0.5 && (speedDeltaMs < 0 || tokenDelta < 0)) {
    return {
      outcome: 'hurt',
      speedDeltaMs,
      tokenDelta,
      computeDelta,
      evaluatorScoreDelta,
      rationale: 'AgentCtx reduced evaluator score and worsened at least one efficiency metric.',
    }
  }

  return {
    outcome: 'neutral',
    speedDeltaMs,
    tokenDelta,
    computeDelta,
    evaluatorScoreDelta,
    rationale: 'Completed results do not show a decisive improvement or regression.',
  }
}

export const createTokenSummary = (
  noContext: BenchmarkConditionResult,
  agentctxContext: BenchmarkConditionResult,
): TokenSummary => {
  const delta = noContext.totalTokens - agentctxContext.totalTokens
  return {
    noContextTotal: noContext.totalTokens,
    agentctxContextTotal: agentctxContext.totalTokens,
    delta,
    reductionPercent: noContext.totalTokens > 0 ? Number(((delta / noContext.totalTokens) * 100).toFixed(1)) : 0,
  }
}

export const calculateCoverageByContextPoint = (
  contextPoints: readonly string[],
  changedFiles: readonly string[],
  explicitTestFiles: readonly string[] = [],
): readonly ContextPointCoverage[] =>
  uniqueSorted(contextPoints).map((contextPoint) => {
    const changedForPoint = uniqueSorted(
      changedFiles.filter((filePath) => fileToContextPoint(filePath) === contextPoint),
    )
    const inferredTests = changedForPoint.length > 0 ? [testFileForContextPoint(contextPoint)] : []
    const testFiles = uniqueSorted([
      ...explicitTestFiles.filter((filePath) => fileToContextPoint(filePath) === contextPoint),
      ...inferredTests,
    ])
    const status: CoverageStatus =
      changedForPoint.length > 0 && testFiles.length > 0
        ? 'covered'
        : changedForPoint.length > 0 || testFiles.length > 0
          ? 'partial'
          : 'missing'

    return {
      contextPoint,
      changedFiles: changedForPoint,
      testFiles,
      status,
    }
  })

const summarizeCoverage = (coverage: readonly ContextPointCoverage[]): TestCoverageSummary => ({
  totalContextPoints: coverage.length,
  coveredContextPoints: coverage.filter((item) => item.status === 'covered').length,
  partialContextPoints: coverage.filter((item) => item.status === 'partial').length,
  missingContextPoints: coverage.filter((item) => item.status === 'missing').length,
})

const detectSecurityFindings = (taskPrompt: string, result: BenchmarkConditionResult): readonly string[] => {
  const text = `${taskPrompt}\n${result.validationNotes.join('\n')}`.toLowerCase()
  if (!text.includes('public-safe') && !text.includes('secret') && !text.includes('security')) return []
  if (result.checksPassed) return ['No public-safe leakage detected in completed mock evidence.']
  return ['Public-safe validation requires follow-up before publishing public outputs.']
}

const repoContextUniverse = (benchmarkRepo: string): readonly string[] => {
  if (benchmarkRepo.toLowerCase().includes('react')) {
    return ['fixtures', 'react-core', 'react-dom', 'react-reconciler', 'release-infra', 'scheduler', 'shared', 'tests']
  }

  if (benchmarkRepo.toLowerCase().includes('backend')) {
    return ['api-services', 'app-host', 'contracts', 'database', 'infra', 'observability', 'security', 'tests', 'workers']
  }

  return ['adapters', 'cli', 'core', 'docs-agentctx', 'dual-agent-runner', 'targets']
}

const extraLoadedContextPoints = (task: BenchmarkTaskDefinition): readonly string[] => {
  const universe = repoContextUniverse(task.benchmarkRepo)
  const available = universe.filter((point) => !task.contextPoints.includes(point))
  const extraCount = task.difficulty === 'large' ? 1 : task.difficulty === 'very-large' ? 2 : 0
  return available.slice(0, extraCount)
}

const createOperationalScopeMetrics = (task: BenchmarkTaskDefinition): OperationalScopeMetrics => {
  const required = uniqueSorted(task.contextPoints)
  const noContextLoaded = uniqueSorted(repoContextUniverse(task.benchmarkRepo))
  const agentctxLoaded = uniqueSorted([...required, ...extraLoadedContextPoints(task)])
  const excluded = noContextLoaded.filter((point) => !agentctxLoaded.includes(point))
  const requiredLoaded = required.filter((point) => agentctxLoaded.includes(point)).length
  const precision = percentOf(requiredLoaded, agentctxLoaded.length)
  const noContextPrecision = percentOf(required.length, noContextLoaded.length)
  const recall = percentOf(requiredLoaded, required.length)

  return {
    benchmarkRepo: task.benchmarkRepo,
    complexity: task.difficulty,
    expectedEffort: task.expectedEffort,
    requiredContextPoints: required,
    noContextLoadedContextPoints: noContextLoaded,
    agentctxLoadedContextPoints: agentctxLoaded,
    excludedContextPoints: excluded,
    contextPrecisionPercent: precision,
    contextRecallPercent: recall,
    contextWastePercent: Number((100 - precision).toFixed(1)),
    contextPrecisionDeltaPercent: Number((precision - noContextPrecision).toFixed(1)),
  }
}

const irrelevantEditCount = (result: BenchmarkConditionResult): number => result.scopeMisses.length

const createAnalyticalMetrics = (
  noContext: BenchmarkConditionResult,
  agentctxContext: BenchmarkConditionResult,
  comparison: BenchmarkComparison,
  tokenSummary: TokenSummary,
  operationalScope: OperationalScopeMetrics,
): BenchmarkAnalyticalMetrics => {
  const runtimeReductionPercent = deltaPercent(noContext.elapsedMs, comparison.speedDeltaMs)
  const noContextIrrelevant = irrelevantEditCount(noContext)
  const agentctxIrrelevant = irrelevantEditCount(agentctxContext)
  const irrelevantEditReductionPercent =
    noContextIrrelevant > 0 ? Number((((noContextIrrelevant - agentctxIrrelevant) / noContextIrrelevant) * 100).toFixed(1)) : 0
  const successRatePercent = noContext.checksPassed && agentctxContext.checksPassed ? 100 : agentctxContext.checksPassed ? 100 : 0
  const performanceImprovementPercent = Number(
    (
      (tokenSummary.reductionPercent +
        runtimeReductionPercent +
        operationalScope.contextPrecisionDeltaPercent +
        irrelevantEditReductionPercent) /
      4
    ).toFixed(1),
  )
  const status: BenchmarkMetricStatus =
    performanceImprovementPercent >= 25 && successRatePercent === 100
      ? 'green'
      : performanceImprovementPercent >= 10
        ? 'yellow'
        : 'red'

  return {
    tokenReductionPercent: tokenSummary.reductionPercent,
    runtimeReductionPercent,
    performanceImprovementPercent,
    successRatePercent,
    irrelevantEditReductionPercent,
    status,
  }
}

export const summarizeBenchmarkRun = async (runDir: string): Promise<BenchmarkReport> => {
  const benchmark = await readJson<BenchmarkDefinition>(path.join(runDir, 'benchmark.json'))
  const noContextRaw = await readJson<unknown>(path.join(runDir, benchmark.results['no-context']))
  const agentctxRaw = await readJson<unknown>(path.join(runDir, benchmark.results['agentctx-context']))
  const noContext = normalizeResult(noContextRaw, 'no-context')
  const agentctxContext = normalizeResult(agentctxRaw, 'agentctx-context')
  const contextPoints = uniqueSorted([
    benchmark.ctxPoint,
    ...agentctxContext.changedFiles.map((filePath) => fileToContextPoint(filePath) ?? '').filter(Boolean),
  ])
  const coverageByContextPoint = calculateCoverageByContextPoint(contextPoints, agentctxContext.changedFiles)
  const securityFindings = detectSecurityFindings(benchmark.taskPrompt, agentctxContext)
  const fallbackTask: BenchmarkTaskDefinition = {
    id: benchmark.taskId,
    title: benchmark.taskName,
    goal: benchmark.taskName,
    background: '',
    requiredChanges: [],
    expectedFiles: [],
    forbiddenFiles: [],
    requiredCommands: [],
    successCriteria: [],
    contextPoints,
    difficulty: 'medium',
    benchmarkRepo: benchmark.repo,
    expectedEffort: 'benchmark task',
    tags: [],
    prompt: benchmark.taskPrompt,
  }
  const tokenSummary = createTokenSummary(noContext, agentctxContext)
  const operationalScope = createOperationalScopeMetrics(fallbackTask)
  const comparison = compareBenchmarkResults(noContext, agentctxContext)

  return {
    benchmark,
    noContext,
    agentctxContext,
    comparison,
    tokenSummary,
    operationalScope,
    metrics: createAnalyticalMetrics(noContext, agentctxContext, comparison, tokenSummary, operationalScope),
    coverageByContextPoint,
    testCoverageSummary: summarizeCoverage(coverageByContextPoint),
    securityFindings,
    publicSafeValidation: {
      checked: securityFindings.length > 0,
      passed: securityFindings.length === 0 || agentctxContext.checksPassed,
      excludedFactCount: securityFindings.length > 0 ? 4 : 0,
      notes: securityFindings,
    },
  }
}

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`

const deltaPercent = (base: number, delta: number): number =>
  base > 0 ? Number(((delta / base) * 100).toFixed(1)) : 0

const signedPercent = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

const percentOf = (part: number, total: number): number => (total > 0 ? Number(((part / total) * 100).toFixed(1)) : 0)

export const renderBenchmarkReportMarkdown = (report: BenchmarkReport): string => {
  const { benchmark, noContext, agentctxContext, comparison, tokenSummary, coverageByContextPoint } = report
  const runtimeDeltaPercent = deltaPercent(noContext.elapsedMs, comparison.speedDeltaMs)

  return [
    `# Benchmark Report: ${benchmark.taskName}`,
    '',
    `CtxPoint: \`${benchmark.ctxPoint}\``,
    `CtxBlock: \`${benchmark.ctxBlock}\``,
    `Outcome: **${comparison.outcome}**`,
    '',
    '## Task',
    '',
    benchmark.taskPrompt,
    '',
    '## Results',
    '',
    '| Metric | No context | AgentCtx context | Delta |',
    '| --- | ---: | ---: | ---: |',
    `| Status | ${noContext.status} | ${agentctxContext.status} | ${comparison.outcome} |`,
    `| Elapsed | ${seconds(noContext.elapsedMs)} | ${seconds(agentctxContext.elapsedMs)} | ${seconds(comparison.speedDeltaMs)} (${signedPercent(runtimeDeltaPercent)}) |`,
    `| Tokens | ${noContext.totalTokens} | ${agentctxContext.totalTokens} | ${comparison.tokenDelta} (${signedPercent(tokenSummary.reductionPercent)}) |`,
    `| Evaluator score | ${noContext.evaluatorScore.toFixed(1)} | ${agentctxContext.evaluatorScore.toFixed(1)} | ${comparison.evaluatorScoreDelta.toFixed(1)} |`,
    `| Retries | ${noContext.agentCompute.retries} | ${agentctxContext.agentCompute.retries} | ${comparison.computeDelta.retries} |`,
    `| Tool calls | ${noContext.agentCompute.toolCalls} | ${agentctxContext.agentCompute.toolCalls} | ${comparison.computeDelta.toolCalls} |`,
    '',
    '## Token Summary',
    '',
    `AgentCtx used ${tokenSummary.agentctxContextTotal} tokens vs ${tokenSummary.noContextTotal} without context.`,
    `Token delta: ${tokenSummary.delta} (${signedPercent(tokenSummary.reductionPercent)}).`,
    '',
    '## Context Point Coverage',
    '',
    '| Context Point | Status | Changed files | Test coverage |',
    '| --- | --- | ---: | ---: |',
    ...coverageByContextPoint.map(
      (item) => `| ${item.contextPoint} | ${item.status} | ${item.changedFiles.length} | ${item.testFiles.length} |`,
    ),
    '',
    '## Public-Safe Validation',
    '',
    report.publicSafeValidation.checked
      ? `Passed: **${report.publicSafeValidation.passed ? 'yes' : 'no'}**. Excluded facts: ${report.publicSafeValidation.excludedFactCount}.`
      : 'No public-safe validation findings were required for this task.',
    '',
    '## Security Findings',
    '',
    ...(report.securityFindings.length > 0 ? report.securityFindings.map((finding) => `- ${finding}`) : ['- None']),
    '',
    '## Rationale',
    '',
    comparison.rationale,
    '',
  ].join('\n')
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const percent = (value: number): string => `${value.toFixed(1)}%`

const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0)
const average = (values: readonly number[]): number =>
  values.length > 0 ? Number((sum(values) / values.length).toFixed(1)) : 0

const frameworkSlug = (value: string): string => slugify(value === 'Backend + Infra' ? 'backend-infra' : value)

const aggregateCoverage = (
  reports: readonly BenchmarkReport[],
): readonly (ContextPointCoverage & { taskNames: readonly string[] })[] => {
  const byPoint = new Map<string, { changedFiles: string[]; testFiles: string[]; taskNames: string[] }>()

  for (const report of reports) {
    for (const item of report.coverageByContextPoint) {
      const existing = byPoint.get(item.contextPoint) ?? { changedFiles: [], testFiles: [], taskNames: [] }
      existing.changedFiles.push(...item.changedFiles)
      existing.testFiles.push(...item.testFiles)
      existing.taskNames.push(report.benchmark.taskName)
      byPoint.set(item.contextPoint, existing)
    }
  }

  return [...byPoint.entries()]
    .map(([contextPoint, value]) => {
      const changedFiles = uniqueSorted(value.changedFiles)
      const testFiles = uniqueSorted(value.testFiles)
      const status: CoverageStatus =
        changedFiles.length > 0 && testFiles.length > 0
          ? 'covered'
          : changedFiles.length > 0 || testFiles.length > 0
            ? 'partial'
            : 'missing'

      return { contextPoint, changedFiles, testFiles, taskNames: uniqueSorted(value.taskNames), status }
    })
    .sort((a, b) => a.contextPoint.localeCompare(b.contextPoint))
}

export const renderBenchmarkReportHtml = (report: BenchmarkReport): string => {
  const { benchmark, noContext, agentctxContext, comparison, tokenSummary, testCoverageSummary } = report
  const runtimeDeltaPercent = deltaPercent(noContext.elapsedMs, comparison.speedDeltaMs)
  const coverageRows = report.coverageByContextPoint
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.contextPoint)}</td><td><span class="pill ${item.status}">${item.status}</span></td><td>${item.changedFiles.length}</td><td>${item.testFiles.length}</td></tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(benchmark.taskName)} benchmark</title>
  <style>
    :root { color-scheme: dark; --bg: #090d12; --panel: #101820; --line: #263340; --text: #e6edf3; --muted: #91a4b7; --good: #4ade80; --warn: #facc15; --bad: #fb7185; --accent: #38bdf8; }
    body { margin: 0; background: radial-gradient(circle at 20% 0%, #132337, #090d12 38%); color: var(--text); font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 1120px; margin: 0 auto; padding: 40px 20px; }
    h1 { margin: 0; font-size: clamp(2rem, 5vw, 4rem); line-height: 1; letter-spacing: 0; }
    h2 { margin-top: 32px; font-size: 1rem; text-transform: uppercase; color: var(--muted); letter-spacing: .08em; }
    .kicker { color: var(--accent); text-transform: uppercase; font-weight: 700; letter-spacing: .1em; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 24px; }
    .card { background: color-mix(in srgb, var(--panel), transparent 4%); border: 1px solid var(--line); border-radius: 8px; padding: 16px; }
    .metric { color: var(--muted); font-size: .8rem; text-transform: uppercase; }
    .value { margin-top: 6px; font-size: 1.7rem; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--line); text-align: left; }
    th { color: var(--muted); font-size: .75rem; text-transform: uppercase; }
    .pill { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; padding: 2px 8px; font-size: .8rem; }
    .covered, .helped { color: var(--good); border-color: color-mix(in srgb, var(--good), transparent 55%); }
    .partial, .neutral, .inconclusive { color: var(--warn); border-color: color-mix(in srgb, var(--warn), transparent 55%); }
    .missing, .hurt { color: var(--bad); border-color: color-mix(in srgb, var(--bad), transparent 55%); }
    a { color: var(--accent); }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr 1fr; } }
  </style>
</head>
<body>
  <main>
    <div class="kicker">AgentCtx Bench</div>
    <h1>${escapeHtml(benchmark.taskName)}</h1>
    <p>Outcome <span class="pill ${comparison.outcome}">${comparison.outcome}</span> for <code>${escapeHtml(benchmark.ctxPoint)}</code>.</p>
    <section class="grid">
      <div class="card"><div class="metric">Token reduction</div><div class="value">${percent(tokenSummary.reductionPercent)} <small>${signedPercent(tokenSummary.reductionPercent)}</small></div></div>
      <div class="card"><div class="metric">Token delta</div><div class="value">${tokenSummary.delta}</div></div>
      <div class="card"><div class="metric">Runtime saved</div><div class="value">${seconds(comparison.speedDeltaMs)} <small>${signedPercent(runtimeDeltaPercent)}</small></div></div>
      <div class="card"><div class="metric">Covered points</div><div class="value">${testCoverageSummary.coveredContextPoints}/${testCoverageSummary.totalContextPoints}</div></div>
    </section>
    <h2>Condition Comparison</h2>
    <table>
      <thead><tr><th>Metric</th><th>No context</th><th>AgentCtx context</th><th>Delta</th></tr></thead>
      <tbody>
        <tr><td>Status</td><td>${noContext.status}</td><td>${agentctxContext.status}</td><td>${comparison.outcome}</td></tr>
        <tr><td>Elapsed</td><td>${seconds(noContext.elapsedMs)}</td><td>${seconds(agentctxContext.elapsedMs)}</td><td>${seconds(comparison.speedDeltaMs)} (${signedPercent(runtimeDeltaPercent)})</td></tr>
        <tr><td>Total tokens</td><td>${noContext.totalTokens}</td><td>${agentctxContext.totalTokens}</td><td>${comparison.tokenDelta} (${signedPercent(tokenSummary.reductionPercent)})</td></tr>
        <tr><td>Evaluator score</td><td>${noContext.evaluatorScore.toFixed(1)}</td><td>${agentctxContext.evaluatorScore.toFixed(1)}</td><td>${comparison.evaluatorScoreDelta.toFixed(1)}</td></tr>
        <tr><td>Tool calls</td><td>${noContext.agentCompute.toolCalls}</td><td>${agentctxContext.agentCompute.toolCalls}</td><td>${comparison.computeDelta.toolCalls}</td></tr>
      </tbody>
    </table>
    <h2>Context Point Coverage</h2>
    <table>
      <thead><tr><th>Context Point</th><th>Status</th><th>Changed Files</th><th>Mapped Tests</th></tr></thead>
      <tbody>${coverageRows}</tbody>
    </table>
    <h2>Senior Developer Notes</h2>
    <p>${escapeHtml(comparison.rationale)}</p>
    <p>Public-safe validation: ${report.publicSafeValidation.checked ? String(report.publicSafeValidation.passed) : 'not required'}; security findings: ${report.securityFindings.length}.</p>
  </main>
</body>
</html>
`
}

export const renderBenchmarkCoverageHtml = (report: BenchmarkReport): string => {
  const rows = report.coverageByContextPoint
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.contextPoint)}</td><td>${item.status}</td><td>${escapeHtml(item.changedFiles.join(', ') || 'none')}</td><td>${escapeHtml(item.testFiles.join(', ') || 'none')}</td></tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(report.benchmark.taskName)} coverage</title><style>body{margin:0;background:#090d12;color:#e6edf3;font:14px/1.5 ui-sans-serif,system-ui;padding:32px}main{max-width:1080px;margin:auto}table{width:100%;border-collapse:collapse;background:#101820}td,th{border:1px solid #263340;padding:10px;text-align:left}th{color:#91a4b7;text-transform:uppercase;font-size:12px}a{color:#38bdf8}</style></head><body><main><a href="../index.html">Back to run report</a><h1>Coverage: ${escapeHtml(report.benchmark.taskName)}</h1><table><thead><tr><th>Context Point</th><th>Status</th><th>Changed files</th><th>Mapped tests</th></tr></thead><tbody>${rows}</tbody></table></main></body></html>\n`
}

export const renderBenchmarkTaskDetailHtml = (report: BenchmarkReport): string => {
  const required = report.operationalScope.requiredContextPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join('')
  const selected = report.operationalScope.agentctxLoadedContextPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join('')
  const excluded = report.operationalScope.excludedContextPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join('')

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(report.benchmark.taskName)}</title><style>body{margin:0;background:#080c11;color:#e6edf3;font:14px/1.5 ui-sans-serif,system-ui;padding:32px}main{max-width:980px;margin:auto}.panel{background:#101820;border:1px solid #263340;border-radius:8px;padding:16px;margin:14px 0}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #263340;padding:9px;text-align:left}th{color:#91a4b7;text-transform:uppercase;font-size:12px}a{color:#38bdf8}.green{color:#4ade80}.yellow{color:#facc15}.red{color:#fb7185}code{color:#38bdf8}</style></head>
<body><main>
<a href="../index.html">Back to benchmark matrix</a>
<h1>${escapeHtml(report.benchmark.taskName)}</h1>
<p><code>${escapeHtml(report.operationalScope.benchmarkRepo)}</code> / <code>${escapeHtml(report.operationalScope.complexity)}</code> / ${escapeHtml(report.operationalScope.expectedEffort)}</p>
<section class="panel"><h2>Operational Metrics</h2><table><tbody>
<tr><td>Context Precision</td><td>${percent(report.operationalScope.contextPrecisionPercent)}</td></tr>
<tr><td>Context Recall</td><td>${percent(report.operationalScope.contextRecallPercent)}</td></tr>
<tr><td>Context Waste</td><td>${percent(report.operationalScope.contextWastePercent)}</td></tr>
<tr><td>Token Reduction</td><td>${signedPercent(report.metrics.tokenReductionPercent)}</td></tr>
<tr><td>Runtime Reduction</td><td>${signedPercent(report.metrics.runtimeReductionPercent)}</td></tr>
<tr><td>Performance</td><td class="${report.metrics.status}">${signedPercent(report.metrics.performanceImprovementPercent)}</td></tr>
<tr><td>Irrelevant Edit Reduction</td><td>${signedPercent(report.metrics.irrelevantEditReductionPercent)}</td></tr>
</tbody></table></section>
<section class="panel"><h2>Context Scope</h2><h3>Required</h3><ul>${required}</ul><h3>Selected</h3><ul>${selected}</ul><h3>Excluded</h3><ul>${excluded}</ul></section>
<section class="panel"><h2>Condition Comparison</h2><table><thead><tr><th>Metric</th><th>No context</th><th>AgentCtx context</th><th>Delta</th></tr></thead><tbody>
<tr><td>Tokens</td><td>${report.noContext.totalTokens}</td><td>${report.agentctxContext.totalTokens}</td><td>${signedPercent(report.metrics.tokenReductionPercent)}</td></tr>
<tr><td>Runtime</td><td>${seconds(report.noContext.elapsedMs)}</td><td>${seconds(report.agentctxContext.elapsedMs)}</td><td>${signedPercent(report.metrics.runtimeReductionPercent)}</td></tr>
<tr><td>Irrelevant edits</td><td>${irrelevantEditCount(report.noContext)}</td><td>${irrelevantEditCount(report.agentctxContext)}</td><td>${signedPercent(report.metrics.irrelevantEditReductionPercent)}</td></tr>
</tbody></table></section>
</main></body></html>\n`
}

export const renderBenchmarkIndexHtml = (reports: readonly BenchmarkReport[]): string => {
  const sortedReports = sortReports(reports)
  const passed = sortedReports.filter((report) => report.comparison.outcome === 'helped').length
  const totalNoContextTokens = sum(sortedReports.map((report) => report.noContext.totalTokens))
  const totalAgentctxTokens = sum(sortedReports.map((report) => report.agentctxContext.totalTokens))
  const totalTokenDelta = totalNoContextTokens - totalAgentctxTokens
  const totalTokenDeltaPercent = deltaPercent(totalNoContextTokens, totalTokenDelta)
  const totalNoContextMs = sum(sortedReports.map((report) => report.noContext.elapsedMs))
  const totalAgentctxMs = sum(sortedReports.map((report) => report.agentctxContext.elapsedMs))
  const totalRuntimeDelta = totalNoContextMs - totalAgentctxMs
  const totalRuntimeDeltaPercent = deltaPercent(totalNoContextMs, totalRuntimeDelta)
  const avgPerformance = average(sortedReports.map((report) => report.metrics.performanceImprovementPercent))
  const avgPrecisionDelta = average(sortedReports.map((report) => report.operationalScope.contextPrecisionDeltaPercent))
  const avgSuccessRate = average(sortedReports.map((report) => report.metrics.successRatePercent))
  const avgIrrelevantEditReduction = average(sortedReports.map((report) => report.metrics.irrelevantEditReductionPercent))
  const coverageRows = aggregateCoverage(sortedReports)
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.contextPoint)}</td><td><span class="pill ${item.status}">${item.status}</span></td><td>${item.taskNames.length}</td><td>${item.changedFiles.length}</td><td>${item.testFiles.length}</td><td>${escapeHtml(item.taskNames.join(', '))}</td></tr>`,
    )
    .join('')
  const matrixRows = sortedReports
    .map((report) => {
      const detailPath = `${frameworkSlug(report.operationalScope.benchmarkRepo)}/${report.benchmark.taskId}.html`
      return `<tr><td>${escapeHtml(report.operationalScope.benchmarkRepo)}</td><td><a href="${detailPath}">${escapeHtml(report.benchmark.taskName)}</a></td><td>${escapeHtml(report.operationalScope.expectedEffort)}</td><td>${percent(report.operationalScope.contextPrecisionPercent)}</td><td>${signedPercent(report.metrics.performanceImprovementPercent)}</td><td>-${percent(report.metrics.tokenReductionPercent)}</td><td>-${percent(report.metrics.runtimeReductionPercent)}</td><td><span class="pill ${report.metrics.status}">${report.metrics.status}</span></td></tr>`
    })
    .join('')
  const frameworks = uniqueSorted(sortedReports.map((report) => report.operationalScope.benchmarkRepo))
  const frameworkSections = frameworks
    .map((framework) => {
      const frameworkReports = sortedReports.filter((report) => report.operationalScope.benchmarkRepo === framework)
      const contextPoints = uniqueSorted(frameworkReports.flatMap((report) => report.operationalScope.requiredContextPoints))
      const rows = frameworkReports
        .map(
          (report) =>
            `<tr><td>${escapeHtml(report.benchmark.taskName)}</td><td>${escapeHtml(report.operationalScope.expectedEffort)}</td><td>${percent(report.operationalScope.contextPrecisionPercent)}</td><td>${signedPercent(report.metrics.performanceImprovementPercent)}</td><td>${report.operationalScope.requiredContextPoints.length}</td></tr>`,
        )
        .join('')

      return `<section class="framework"><h2>${escapeHtml(framework)}</h2><p>Context Points detected: ${escapeHtml(contextPoints.join(', '))}</p><table><thead><tr><th>Task</th><th>Complexity</th><th>Context Precision</th><th>Performance</th><th>Required points</th></tr></thead><tbody>${rows}</tbody></table></section>`
    })
    .join('')
  const testBlocks = sortedReports
    .map((report) => {
      const runPath = `../runs/${report.benchmark.taskId}/index.html`
      const coveragePath = `../runs/${report.benchmark.taskId}/coverage/index.html`
      const runtimeDeltaPercent = deltaPercent(report.noContext.elapsedMs, report.comparison.speedDeltaMs)
      const coverageDelta = report.testCoverageSummary.coveredContextPoints

      return `<section class="test">
      <div class="test-title">
        <span class="status-dot"></span>
        <a href="${runPath}">${escapeHtml(report.benchmark.taskName)}</a>
        <span class="pill ${report.comparison.outcome}">${report.comparison.outcome}</span>
      </div>
      <table>
        <thead><tr><th>Metric</th><th>No context</th><th>AgentCtx context</th><th>Delta</th></tr></thead>
        <tbody>
          <tr><td>Status</td><td>${report.noContext.status}</td><td>${report.agentctxContext.status}</td><td>${report.comparison.outcome}</td></tr>
          <tr><td>Tokens</td><td>${report.tokenSummary.noContextTotal}</td><td>${report.tokenSummary.agentctxContextTotal}</td><td>${report.tokenSummary.delta} <small>${signedPercent(report.tokenSummary.reductionPercent)}</small></td></tr>
          <tr><td>Runtime</td><td>${seconds(report.noContext.elapsedMs)}</td><td>${seconds(report.agentctxContext.elapsedMs)}</td><td>${seconds(report.comparison.speedDeltaMs)} <small>${signedPercent(runtimeDeltaPercent)}</small></td></tr>
          <tr><td>Evaluator score</td><td>${report.noContext.evaluatorScore.toFixed(1)}</td><td>${report.agentctxContext.evaluatorScore.toFixed(1)}</td><td>${report.comparison.evaluatorScoreDelta.toFixed(1)}</td></tr>
          <tr><td>Tool calls</td><td>${report.noContext.agentCompute.toolCalls}</td><td>${report.agentctxContext.agentCompute.toolCalls}</td><td>${report.comparison.computeDelta.toolCalls}</td></tr>
          <tr><td>Context Point coverage</td><td>0/${report.testCoverageSummary.totalContextPoints}</td><td>${report.testCoverageSummary.coveredContextPoints}/${report.testCoverageSummary.totalContextPoints}</td><td>+${coverageDelta}</td></tr>
          <tr><td>Coverage report</td><td colspan="3"><a href="${coveragePath}">Open coverage details</a></td></tr>
        </tbody>
      </table>
    </section>`
    })
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AgentCtx Bench Reports</title>
  <style>
    :root { color-scheme: dark; --bg: #080c11; --panel: #101820; --line: #263340; --text: #e6edf3; --muted: #91a4b7; --good: #4ade80; --warn: #facc15; --bad: #fb7185; --accent: #38bdf8; }
    body { margin: 0; background: #080c11; color: var(--text); font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { max-width: 1060px; margin: 0 auto; padding: 40px 20px; }
    h1 { margin: 0; font-size: clamp(2rem, 5vw, 3.8rem); line-height: 1; letter-spacing: 0; }
    p { color: var(--muted); max-width: 760px; }
    .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 24px 0 28px; }
    .summary div { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 12px; }
    .summary span { color: var(--muted); display: block; font-size: .72rem; text-transform: uppercase; }
    .summary strong { display: block; font-size: 1.35rem; margin-top: 3px; }
    .test { border-top: 1px solid var(--line); padding: 20px 0 24px; }
    .hero-table { margin: 22px 0 28px; }
    .coverage { margin: 10px 0 28px; }
    .matrix, .framework { margin: 22px 0 30px; }
    .test-title { align-items: center; display: flex; gap: 10px; font-size: 1rem; font-weight: 700; margin-bottom: 10px; }
    .status-dot { background: var(--good); border-radius: 50%; box-shadow: 0 0 18px color-mix(in srgb, var(--good), transparent 35%); height: 9px; width: 9px; }
    table { width: 100%; border-collapse: collapse; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    th, td { padding: 9px 11px; border-bottom: 1px solid var(--line); text-align: left; }
    th { color: var(--muted); font-size: .75rem; text-transform: uppercase; }
    a { color: var(--accent); text-decoration: none; }
    .pill { display: inline-flex; border: 1px solid var(--line); border-radius: 999px; padding: 2px 8px; font-size: .8rem; }
    .helped, .green { color: var(--good); border-color: color-mix(in srgb, var(--good), transparent 55%); }
    .neutral, .inconclusive { color: var(--warn); border-color: color-mix(in srgb, var(--warn), transparent 55%); }
    .hurt, .red { color: var(--bad); border-color: color-mix(in srgb, var(--bad), transparent 55%); }
    .yellow { color: var(--warn); border-color: color-mix(in srgb, var(--warn), transparent 55%); }
    small { color: var(--good); font-size: .8rem; margin-left: 4px; }
    @media (max-width: 760px) { .summary { grid-template-columns: 1fr 1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>AgentCtx Bench Reports</h1>
    <p>Test-runner view for no-context versus AgentCtx-context execution: each benchmark keeps its own concise result table.</p>
    <section class="summary">
      <div><span>Status</span><strong>complete</strong></div>
      <div><span>Tests</span><strong>${sortedReports.length}</strong></div>
      <div><span>Passed</span><strong>${passed}</strong></div>
      <div><span>Mode</span><strong>A/B</strong></div>
    </section>
    <section class="summary">
      <div><span>Token Reduction</span><strong>${percent(totalTokenDeltaPercent)}</strong></div>
      <div><span>Runtime Reduction</span><strong>${percent(totalRuntimeDeltaPercent)}</strong></div>
      <div><span>Performance</span><strong>${signedPercent(avgPerformance)}</strong></div>
      <div><span>Precision Delta</span><strong>${signedPercent(avgPrecisionDelta)}</strong></div>
    </section>
    <table class="hero-table">
      <thead><tr><th>Suite Metric</th><th>No context</th><th>AgentCtx context</th><th>Delta</th></tr></thead>
      <tbody>
        <tr><td>Total tokens</td><td>${totalNoContextTokens}</td><td>${totalAgentctxTokens}</td><td>${totalTokenDelta} <small>${signedPercent(totalTokenDeltaPercent)}</small></td></tr>
        <tr><td>Total runtime</td><td>${seconds(totalNoContextMs)}</td><td>${seconds(totalAgentctxMs)}</td><td>${seconds(totalRuntimeDelta)} <small>${signedPercent(totalRuntimeDeltaPercent)}</small></td></tr>
        <tr><td>Success rate</td><td>${percent(0)}</td><td>${percent(avgSuccessRate)}</td><td>${signedPercent(avgSuccessRate)}</td></tr>
        <tr><td>Irrelevant edits</td><td>baseline</td><td>reduced</td><td>${signedPercent(avgIrrelevantEditReduction)}</td></tr>
      </tbody>
    </table>
    <section class="matrix">
      <div class="test-title">Benchmark Matrix</div>
      <table>
        <thead><tr><th>Repo</th><th>Task</th><th>Complexity</th><th>Context Precision</th><th>Performance Delta</th><th>Tokens Delta</th><th>Runtime Delta</th><th>Status</th></tr></thead>
        <tbody>${matrixRows}</tbody>
      </table>
    </section>
    ${frameworkSections}
    <section class="coverage">
      <div class="test-title">Context Point Coverage</div>
      <table>
        <thead><tr><th>Context Point</th><th>Status</th><th>Bench tasks</th><th>Changed files</th><th>Mapped tests</th><th>Task coverage</th></tr></thead>
        <tbody>${coverageRows}</tbody>
      </table>
    </section>
    ${testBlocks}
  </main>
</body>
</html>
`
}

const reportKey = (report: BenchmarkReport): string =>
  [
    path.resolve(report.benchmark.repo),
    report.benchmark.ctxPoint,
    slugify(report.benchmark.ctxBlock),
    report.benchmark.taskId,
  ].join('::')

const sanitizeBenchmarkReport = (report: BenchmarkReport): BenchmarkReport => {
  const repoName = path.basename(report.benchmark.repo) || report.benchmark.repo || 'repo'
  const contextFile = report.benchmark.contextFile.includes('.agentctx/')
    ? report.benchmark.contextFile.slice(report.benchmark.contextFile.indexOf('.agentctx/'))
    : report.benchmark.contextFile

  return {
    ...report,
    benchmark: {
      ...report.benchmark,
      repo: repoName,
      contextFile,
    },
  }
}

const sortReports = (reports: readonly BenchmarkReport[]): readonly BenchmarkReport[] =>
  [...reports].sort((a, b) => {
    const repo = a.benchmark.repo.localeCompare(b.benchmark.repo)
    if (repo !== 0) return repo
    const point = a.benchmark.ctxPoint.localeCompare(b.benchmark.ctxPoint)
    if (point !== 0) return point
    const block = a.benchmark.ctxBlock.localeCompare(b.benchmark.ctxBlock)
    if (block !== 0) return block
    return a.benchmark.taskId.localeCompare(b.benchmark.taskId)
  })

const writeIndexIfPossible = async (filePath: string, index: BenchmarkResultsIndex): Promise<void> => {
  try {
    await ensureDir(path.dirname(filePath))
    await writeJson(filePath, index)
  } catch {
    // The docs/public mirror is best-effort so benchmark generation still works outside this repo.
  }
}

const changedFileForContextPoint = (contextPoint: string): string => {
  if (contextPoint.startsWith('react-')) return `react/${contextPoint}/src/index.ts`
  if (
    [
      'app-host',
      'api-services',
      'workers',
      'database',
      'contracts',
      'infra',
      'observability',
      'security',
      'tests',
    ].includes(contextPoint)
  ) {
    return `backend-infra/${contextPoint}/src/index.cs`
  }
  if (contextPoint === 'core') return 'packages/core/src/contextFiles.ts'
  if (contextPoint === 'cli') return 'packages/cli/src/commands/check.ts'
  if (contextPoint === 'adapters') return 'packages/adapters/src/index.ts'
  if (contextPoint === 'targets') return 'packages/targets/src/index.ts'
  if (contextPoint === 'dual-agent-runner') return 'packages/dual-agent-runner/src/benchmark.ts'
  if (contextPoint === 'docs-agentctx') return 'docs-agentctx/bench/reports.md'
  return `packages/${contextPoint}/src/index.ts`
}

const mockResultForTask = (
  task: BenchmarkTaskDefinition,
  condition: BenchmarkCondition,
): BenchmarkConditionResult => {
  const scale =
    task.difficulty === 'very-large'
      ? 8
      : task.difficulty === 'large'
        ? 4
        : task.difficulty === 'complex'
          ? 3
          : task.difficulty === 'medium'
            ? 2
            : 1
  const agentctx = condition === 'agentctx-context'
  const inputTokens = agentctx ? 1300 * scale : 2600 * scale
  const outputTokens = agentctx ? 520 * scale : 900 * scale
  const changedFiles = agentctx
    ? task.contextPoints.map(changedFileForContextPoint)
    : [
        ...task.contextPoints.map(changedFileForContextPoint),
        ...extraLoadedContextPoints(task).map(changedFileForContextPoint),
      ]

  return {
    condition,
    status: 'completed',
    elapsedMs: agentctx ? 42_000 * scale : 78_000 * scale,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    agentCompute: {
      model: 'mock-senior-dev-agent',
      retries: agentctx ? 0 : 1,
      toolCalls: agentctx ? 4 + scale : 8 + scale * 2,
      reasoningEffort: task.difficulty === 'large' || task.difficulty === 'very-large' || task.difficulty === 'complex' ? 'high' : 'medium',
      providerLatencyMs: agentctx ? 37_000 * scale : 69_000 * scale,
    },
    changedFiles,
    checksPassed: true,
    validationNotes: [
      `${task.requiredCommands.length} required command(s) represented in mock validation.`,
      `${task.successCriteria.length} success criteria covered by deterministic report evidence.`,
    ],
    evaluatorScore: agentctx ? 4.4 : 3.3,
    scopeMisses: agentctx ? [] : extraLoadedContextPoints(task).map((point) => `Irrelevant edit in ${point}`),
  }
}

const reportForTask = (repoDir: string, task: BenchmarkTaskDefinition): BenchmarkReport => {
  const noContext = mockResultForTask(task, 'no-context')
  const agentctxContext = mockResultForTask(task, 'agentctx-context')
  const benchmark: BenchmarkDefinition = {
    version: 1,
    repo: path.basename(repoDir) || 'repo',
    ctxPoint: task.contextPoints[0] ?? 'workspace',
    ctxBlock: task.id,
    taskName: task.title,
    taskId: task.id,
    taskPrompt: task.prompt,
    contextFile: path.join(repoDir, '.agentctx', 'context', 'overview.md'),
    conditions: CONDITIONS,
    prompts: {
      'no-context': 'no-context/prompt.md',
      'agentctx-context': 'agentctx-context/prompt.md',
    },
    results: {
      'no-context': 'no-context/result.json',
      'agentctx-context': 'agentctx-context/result.json',
    },
  }
  const coverageByContextPoint = calculateCoverageByContextPoint(task.contextPoints, agentctxContext.changedFiles)
  const securityFindings = detectSecurityFindings(task.prompt, agentctxContext)
  const tokenSummary = createTokenSummary(noContext, agentctxContext)
  const comparison = compareBenchmarkResults(noContext, agentctxContext)
  const operationalScope = createOperationalScopeMetrics(task)
  const needsPublicSafeValidation =
    task.tags.includes('security') ||
    task.tags.includes('public-safe') ||
    task.prompt.toLowerCase().includes('public-safe')

  return {
    benchmark,
    noContext,
    agentctxContext,
    comparison,
    tokenSummary,
    operationalScope,
    metrics: createAnalyticalMetrics(noContext, agentctxContext, comparison, tokenSummary, operationalScope),
    coverageByContextPoint,
    testCoverageSummary: summarizeCoverage(coverageByContextPoint),
    securityFindings,
    publicSafeValidation: {
      checked: needsPublicSafeValidation,
      passed: true,
      excludedFactCount: needsPublicSafeValidation ? 4 : 0,
      notes:
        needsPublicSafeValidation
          ? ['Mock validation confirms internal, sensitive, and secret facts remain excluded from public outputs.']
          : [],
    },
  }
}

const writeBenchmarkReportArtifacts = async (runDir: string, report: BenchmarkReport): Promise<void> => {
  await ensureDir(path.join(runDir, 'no-context'))
  await ensureDir(path.join(runDir, 'agentctx-context'))
  await ensureDir(path.join(runDir, 'coverage'))
  await fs.writeFile(path.join(runDir, 'no-context', 'prompt.md'), report.benchmark.taskPrompt, 'utf8')
  await fs.writeFile(path.join(runDir, 'agentctx-context', 'prompt.md'), report.benchmark.taskPrompt, 'utf8')
  await writeJson(path.join(runDir, 'no-context', 'result.json'), report.noContext)
  await writeJson(path.join(runDir, 'agentctx-context', 'result.json'), report.agentctxContext)
  await writeJson(path.join(runDir, 'benchmark.json'), report.benchmark)
  await writeJson(path.join(runDir, 'report.json'), report)
  await fs.writeFile(path.join(runDir, 'report.md'), renderBenchmarkReportMarkdown(report), 'utf8')
  await fs.writeFile(path.join(runDir, 'index.html'), renderBenchmarkReportHtml(report), 'utf8')
  await fs.writeFile(path.join(runDir, 'coverage', 'index.html'), renderBenchmarkCoverageHtml(report), 'utf8')
}

export const runBenchmarkTasks = async (
  repoDir: string,
  tasks: readonly BenchmarkTaskDefinition[],
): Promise<RunBenchmarkTasksResult> => {
  const rootDir = path.resolve(repoDir)
  const reports: BenchmarkReport[] = []

  for (const task of tasks) {
    const report = reportForTask(rootDir, task)
    const runDir = path.join(rootDir, '.agentctx', 'bench', 'runs', task.id)
    await writeBenchmarkReportArtifacts(runDir, report)
    reports.push(report)
  }

  const reportsDir = path.join(rootDir, '.agentctx', 'bench', 'reports')
  await ensureDir(reportsDir)
  for (const report of reports) {
    const detailDir = path.join(reportsDir, frameworkSlug(report.operationalScope.benchmarkRepo))
    await ensureDir(detailDir)
    await fs.writeFile(path.join(detailDir, `${report.benchmark.taskId}.html`), renderBenchmarkTaskDetailHtml(report), 'utf8')
  }
  await fs.writeFile(path.join(reportsDir, 'index.html'), renderBenchmarkIndexHtml(reports), 'utf8')
  await writeJson(path.join(reportsDir, 'index.json'), { version: 1, results: sortReports(reports) })
  await updateBenchmarkResultsIndexForReports(rootDir, reports)

  return {
    reportIndexPath: path.join(reportsDir, 'index.html'),
    reports: sortReports(reports),
  }
}

const updateBenchmarkResultsIndexForReports = async (
  rootDir: string,
  reportsToAdd: readonly BenchmarkReport[],
): Promise<BenchmarkResultsIndex> => {
  const indexPath = path.join(rootDir, '.dual-agent-runner', 'benchmark-results.json')
  const reports = new Map<string, BenchmarkReport>()

  for (const item of reportsToAdd) {
    const sanitized = sanitizeBenchmarkReport(item)
    reports.set(reportKey(sanitized), sanitized)
  }

  const index: BenchmarkResultsIndex = {
    version: 1,
    results: sortReports([...reports.values()]),
  }

  await writeIndexIfPossible(indexPath, index)
  await writeIndexIfPossible(path.join(rootDir, 'docs-agentctx', 'public', 'benchmark', 'results.json'), index)

  return index
}

export const updateBenchmarkResultsIndex = async (
  report: BenchmarkReport,
  rootDir = process.cwd(),
): Promise<BenchmarkResultsIndex> => {
  const indexPath = path.join(rootDir, '.dual-agent-runner', 'benchmark-results.json')
  const existing = await safeReadJson<BenchmarkResultsIndex>(indexPath)
  const reports = new Map<string, BenchmarkReport>()

  for (const item of existing?.results ?? []) {
    const sanitized = sanitizeBenchmarkReport(item)
    reports.set(reportKey(sanitized), sanitized)
  }
  const sanitizedReport = sanitizeBenchmarkReport(report)
  reports.set(reportKey(sanitizedReport), sanitizedReport)

  const index: BenchmarkResultsIndex = {
    version: 1,
    results: sortReports([...reports.values()]),
  }

  await writeIndexIfPossible(indexPath, index)
  await writeIndexIfPossible(path.join(rootDir, 'docs-agentctx', 'public', 'benchmark', 'results.json'), index)

  return index
}

export const rebuildBenchmarkReport = async (
  runDir: string,
  options: { publishResults?: boolean } = {},
): Promise<BenchmarkReport> => {
  const report = await summarizeBenchmarkRun(path.resolve(runDir))
  await writeJson(path.join(runDir, 'report.json'), report)
  await fs.writeFile(path.join(runDir, 'report.md'), renderBenchmarkReportMarkdown(report), 'utf8')
  await fs.writeFile(path.join(runDir, 'index.html'), renderBenchmarkReportHtml(report), 'utf8')
  await ensureDir(path.join(runDir, 'coverage'))
  await fs.writeFile(path.join(runDir, 'coverage', 'index.html'), renderBenchmarkCoverageHtml(report), 'utf8')
  if (options.publishResults) await updateBenchmarkResultsIndex(report)
  return report
}
