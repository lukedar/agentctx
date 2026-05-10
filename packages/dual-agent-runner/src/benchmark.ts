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

export type BenchmarkReport = Readonly<{
  benchmark: BenchmarkDefinition
  noContext: BenchmarkConditionResult
  agentctxContext: BenchmarkConditionResult
  comparison: BenchmarkComparison
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

export const summarizeBenchmarkRun = async (runDir: string): Promise<BenchmarkReport> => {
  const benchmark = await readJson<BenchmarkDefinition>(path.join(runDir, 'benchmark.json'))
  const noContextRaw = await readJson<unknown>(path.join(runDir, benchmark.results['no-context']))
  const agentctxRaw = await readJson<unknown>(path.join(runDir, benchmark.results['agentctx-context']))
  const noContext = normalizeResult(noContextRaw, 'no-context')
  const agentctxContext = normalizeResult(agentctxRaw, 'agentctx-context')

  return {
    benchmark,
    noContext,
    agentctxContext,
    comparison: compareBenchmarkResults(noContext, agentctxContext),
  }
}

const seconds = (ms: number): string => `${(ms / 1000).toFixed(1)}s`

export const renderBenchmarkReportMarkdown = (report: BenchmarkReport): string => {
  const { benchmark, noContext, agentctxContext, comparison } = report

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
    `| Elapsed | ${seconds(noContext.elapsedMs)} | ${seconds(agentctxContext.elapsedMs)} | ${seconds(comparison.speedDeltaMs)} |`,
    `| Tokens | ${noContext.totalTokens} | ${agentctxContext.totalTokens} | ${comparison.tokenDelta} |`,
    `| Evaluator score | ${noContext.evaluatorScore.toFixed(1)} | ${agentctxContext.evaluatorScore.toFixed(1)} | ${comparison.evaluatorScoreDelta.toFixed(1)} |`,
    `| Retries | ${noContext.agentCompute.retries} | ${agentctxContext.agentCompute.retries} | ${comparison.computeDelta.retries} |`,
    `| Tool calls | ${noContext.agentCompute.toolCalls} | ${agentctxContext.agentCompute.toolCalls} | ${comparison.computeDelta.toolCalls} |`,
    '',
    '## Rationale',
    '',
    comparison.rationale,
    '',
  ].join('\n')
}

const reportKey = (report: BenchmarkReport): string =>
  [
    path.resolve(report.benchmark.repo),
    report.benchmark.ctxPoint,
    slugify(report.benchmark.ctxBlock),
    report.benchmark.taskId,
  ].join('::')

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

export const updateBenchmarkResultsIndex = async (
  report: BenchmarkReport,
  rootDir = process.cwd(),
): Promise<BenchmarkResultsIndex> => {
  const indexPath = path.join(rootDir, '.dual-agent-runner', 'benchmark-results.json')
  const existing = await safeReadJson<BenchmarkResultsIndex>(indexPath)
  const reports = new Map<string, BenchmarkReport>()

  for (const item of existing?.results ?? []) reports.set(reportKey(item), item)
  reports.set(reportKey(report), report)

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
  if (options.publishResults) await updateBenchmarkResultsIndex(report)
  return report
}
