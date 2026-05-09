import { promises as fs } from 'node:fs'
import type { Dirent } from 'node:fs'
import path from 'node:path'

export type BenchmarkConditionName = 'no-context' | 'agentctx-context'
export type BenchmarkDifficulty = 'easy' | 'medium' | 'hard' | 'complex'
export type BenchmarkOutcome = 'helped' | 'hurt' | 'neutral' | 'inconclusive'

export type BenchmarkTask = Readonly<{
  id: string
  title: string
  difficulty: BenchmarkDifficulty
  goal: string
  expectedFiles: readonly string[]
  forbiddenFiles: readonly string[]
  validationCommands: readonly string[]
  successRubric: readonly string[]
}>

export type BenchmarkSuite = Readonly<{
  version: 1
  id: string
  title: string
  repoProfile: string
  conditions: readonly BenchmarkConditionName[]
  tasks: readonly BenchmarkTask[]
}>

export type BenchmarkConditionResult = Readonly<{
  taskId: string
  condition: BenchmarkConditionName
  status: 'pending' | 'pass' | 'fail'
  elapsedMs?: number
  inputEstimatedTokens?: number
  outputEstimatedTokens?: number
  retryCount?: number
  checksPassed?: boolean
  evaluatorScore?: number
  changedFiles?: readonly string[]
  notes?: readonly string[]
}>

export type BenchmarkComparison = Readonly<{
  taskId: string
  outcome: BenchmarkOutcome
  rationale: string
  noContext?: BenchmarkConditionResult
  agentctxContext?: BenchmarkConditionResult
}>

export type BenchmarkRunSummary = Readonly<{
  suite: BenchmarkSuite
  runDir: string
  contextEstimatedTokens: number
  comparisons: readonly BenchmarkComparison[]
}>

const CONDITION_NAMES: readonly BenchmarkConditionName[] = ['no-context', 'agentctx-context']

const estimateTokens = (text: string): number => Math.ceil(text.length / 4)

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const stringArray = (value: unknown): readonly string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const ensureDir = async (dir: string): Promise<void> => {
  await fs.mkdir(dir, { recursive: true })
}

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const walkFiles = async (
  dir: string,
  options: { maxFiles?: number; include?: (filePath: string) => boolean } = {},
): Promise<readonly string[]> => {
  const output: string[] = []
  const maxFiles = options.maxFiles ?? 400

  const walk = async (current: string): Promise<void> => {
    if (output.length >= maxFiles) return

    let entries: Dirent[] = []
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries.sort((a: Dirent, b: Dirent) => a.name.localeCompare(b.name))) {
      if (output.length >= maxFiles) return
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue

      const absolute = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(absolute)
        continue
      }

      if (!entry.isFile()) continue
      const rel = absolute.split(path.sep).join('/').replace(/^[A-Z]:/i, '')
      if (options.include && !options.include(rel)) continue
      output.push(absolute)
    }
  }

  await walk(dir)
  return output
}

const readTextIfExists = async (filePath: string): Promise<string> => {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return ''
  }
}

export const estimateAgentCtxContextTokens = async (repoDir: string): Promise<number> => {
  const directFiles = ['AGENTS.md', 'CLAUDE.md', 'llms.txt'].map((fileName) => path.join(repoDir, fileName))
  const contextDir = path.join(repoDir, '.agentctx', 'context')
  const contextFiles = await walkFiles(contextDir, {
    maxFiles: 80,
    include: (filePath) => filePath.endsWith('.md'),
  })

  let total = 0
  for (const filePath of [...directFiles, ...contextFiles]) {
    total += estimateTokens(await readTextIfExists(filePath))
  }
  return total
}

const detectRepoProfile = async (repoDir: string): Promise<string> => {
  const hasSource = await fileExists(path.join(repoDir, 'Source'))
  const hasData = await fileExists(path.join(repoDir, 'Data'))
  const hasDocumentation = await fileExists(path.join(repoDir, 'Documentation'))
  const hasPython = await fileExists(path.join(repoDir, 'Tools', 'Python', 'requirements.txt'))

  const parts = [
    hasSource ? '.NET source monorepo' : undefined,
    hasDocumentation ? 'documentation surface' : undefined,
    hasData ? 'data and operational scripts' : undefined,
    hasPython ? 'Python tooling' : undefined,
  ].filter((part): part is string => Boolean(part))

  return parts.length ? parts.join(', ') : 'polyglot repository'
}

export const createBenchmarkSuiteForRepo = async (repoDir: string): Promise<BenchmarkSuite> => {
  const repoName = path.basename(repoDir)
  const profile = await detectRepoProfile(repoDir)

  return {
    version: 1,
    id: `${repoName.toLowerCase()}-agentctx-adoption`,
    title: `${repoName} AgentCtx Adoption Benchmark`,
    repoProfile: profile,
    conditions: CONDITION_NAMES,
    tasks: [
      {
        id: 'easy-docs-workflow',
        title: 'Find the documentation entrypoint and explain the docs workflow',
        difficulty: 'easy',
        goal: 'Identify the documentation app entrypoint, build tooling, and safe command sequence for editing docs without changing application source code.',
        expectedFiles: ['Documentation/**', 'Source/Documentation/**', '**/package.json', '**/*.csproj'],
        forbiddenFiles: ['Source/Database/**', 'Source/Clients/**', 'Data/**'],
        validationCommands: [],
        successRubric: [
          'Finds the correct documentation directories',
          'Identifies the relevant build/config files',
          'Avoids editing application, database, or data scripts',
        ],
      },
      {
        id: 'medium-angular-webapp-change',
        title: 'Plan a safe Angular WebApp change',
        difficulty: 'medium',
        goal: 'Locate the Angular WebApp surface, identify the framework/build/test files, and plan a minimal UI change without touching backend services or generated assets.',
        expectedFiles: [
          'Source/Apps/WebApp/Quantifeed.WebApp/angular.json',
          'Source/Apps/WebApp/Quantifeed.WebApp/package.json',
          'Source/Apps/WebApp/Quantifeed.WebApp/app/**',
          'Source/Apps/WebApp/weblib/**',
        ],
        forbiddenFiles: ['Source/Services/**', 'Source/Database/**', 'Documentation/images/**'],
        validationCommands: [],
        successRubric: [
          'Finds the Angular workspace and UI source boundaries',
          'Identifies relevant lint/test/build commands where present',
          'Avoids backend, database, and binary/image assets',
        ],
      },
      {
        id: 'medium-dotnet-service-change',
        title: 'Plan a safe .NET service change',
        difficulty: 'medium',
        goal: 'Locate a service host, API, models, repositories, and tests for a small .NET service change, then identify the minimal files to inspect before coding.',
        expectedFiles: ['Source/Services/**/Program.cs', 'Source/Services/**/*.csproj', 'Source/Services/**/*.sln', 'Source/Shared/**'],
        forbiddenFiles: ['Source/Apps/WebApp/**', 'Documentation/images/**', 'Data/Clients/ExampleScripts/**'],
        validationCommands: [],
        successRubric: [
          'Constrains work to the relevant service boundary',
          'Identifies tests and shared packages likely to be affected',
          'Avoids unrelated frontend, docs image, and example data edits',
        ],
      },
      {
        id: 'hard-sre-operational-impact',
        title: 'Assess SRE impact for an operational change',
        difficulty: 'hard',
        goal: 'Trace Docker, scripts, service host configuration, and CI/linter surfaces needed to assess an operational change safely.',
        expectedFiles: ['Source/Docker/**', 'Source/**/Dockerfile*', 'Source/Services/**/appsettings*.json', '.github/**'],
        forbiddenFiles: ['Documentation/images/**', 'Data/Clients/ExampleScripts/**', 'Source/Clients/**'],
        validationCommands: [],
        successRubric: [
          'Finds operational artifacts without broad source churn',
          'Identifies environment and deployment assumptions',
          'Calls out validation, rollback, and safety checks',
        ],
      },
      {
        id: 'complex-cross-domain-change',
        title: 'Trace a cross-domain change across frontend, services, shared contracts, and ops',
        difficulty: 'complex',
        goal: 'Given a product-facing change, identify the Angular, .NET service, shared contract, documentation, data/ops, and SRE surfaces likely to be affected before coding.',
        expectedFiles: [
          'Source/Apps/WebApp/**',
          'Source/Services/**',
          'Source/Shared/**',
          'Documentation/**',
          'Data/**',
          'Source/Docker/**',
        ],
        forbiddenFiles: ['**/*.png', '**/*.xlsx', '**/*.nupkg', '**/*.exe'],
        validationCommands: [],
        successRubric: [
          'Separates frontend, backend, shared, docs, data, and SRE responsibilities',
          'Prioritizes the smallest safe implementation path',
          'Avoids generated outputs, binaries, screenshots, packages, and broad unrelated edits',
        ],
      },
    ],
  }
}

export const loadBenchmarkSuite = async (filePath: string): Promise<BenchmarkSuite> => {
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed: unknown = JSON.parse(raw)
  if (!isObject(parsed)) throw new Error('Invalid benchmark suite: expected object')

  const tasksValue = parsed.tasks
  if (!Array.isArray(tasksValue)) throw new Error('Invalid benchmark suite: missing tasks array')

  const tasks = tasksValue.map((taskValue): BenchmarkTask => {
    if (!isObject(taskValue)) throw new Error('Invalid benchmark task: expected object')
    const difficulty = taskValue.difficulty
    return {
      id: typeof taskValue.id === 'string' ? taskValue.id : '',
      title: typeof taskValue.title === 'string' ? taskValue.title : '',
      difficulty: difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard' || difficulty === 'complex'
        ? difficulty
        : 'medium',
      goal: typeof taskValue.goal === 'string' ? taskValue.goal : '',
      expectedFiles: stringArray(taskValue.expectedFiles),
      forbiddenFiles: stringArray(taskValue.forbiddenFiles),
      validationCommands: stringArray(taskValue.validationCommands),
      successRubric: stringArray(taskValue.successRubric),
    }
  })

  const conditions = stringArray(parsed.conditions)
    .filter((condition): condition is BenchmarkConditionName =>
      condition === 'no-context' || condition === 'agentctx-context')

  return {
    version: 1,
    id: typeof parsed.id === 'string' ? parsed.id : 'benchmark-suite',
    title: typeof parsed.title === 'string' ? parsed.title : 'AgentCtx Benchmark Suite',
    repoProfile: typeof parsed.repoProfile === 'string' ? parsed.repoProfile : 'repository',
    conditions: conditions.length ? conditions : CONDITION_NAMES,
    tasks,
  }
}

export const validateBenchmarkSuite = (suite: BenchmarkSuite): readonly string[] => {
  const errors: string[] = []
  if (!suite.id.trim()) errors.push('Suite id is required')
  if (!suite.title.trim()) errors.push('Suite title is required')
  if (!suite.conditions.includes('no-context')) errors.push('Suite must include no-context')
  if (!suite.conditions.includes('agentctx-context')) errors.push('Suite must include agentctx-context')
  if (suite.tasks.length === 0) errors.push('Suite must include at least one task')

  const ids = new Set<string>()
  for (const task of suite.tasks) {
    if (!task.id.trim()) errors.push('Task id is required')
    if (ids.has(task.id)) errors.push(`Duplicate task id: ${task.id}`)
    ids.add(task.id)
    if (!task.title.trim()) errors.push(`Task ${task.id} title is required`)
    if (!task.goal.trim()) errors.push(`Task ${task.id} goal is required`)
  }

  return errors
}

const renderConditionPrompt = (
  suite: BenchmarkSuite,
  task: BenchmarkTask,
  condition: BenchmarkConditionName,
  contextEstimatedTokens: number,
): string => [
  `# Benchmark Task: ${task.title}`,
  '',
  `Suite: ${suite.title}`,
  `Task ID: ${task.id}`,
  `Difficulty: ${task.difficulty}`,
  `Condition: ${condition}`,
  '',
  '## Goal',
  '',
  task.goal,
  '',
  '## Context Rule',
  '',
  condition === 'no-context'
    ? 'Do not use generated AgentCtx files such as AGENTS.md, CLAUDE.md, llms.txt, or .agentctx/context. Work from the repo tree and normal source files only.'
    : `Use generated AgentCtx files before searching broadly. Estimated generated context available: ${contextEstimatedTokens} tokens.`,
  '',
  '## Expected File Areas',
  '',
  ...task.expectedFiles.map((filePattern) => `- ${filePattern}`),
  '',
  '## Forbidden File Areas',
  '',
  ...task.forbiddenFiles.map((filePattern) => `- ${filePattern}`),
  '',
  '## Validation Commands',
  '',
  ...(task.validationCommands.length ? task.validationCommands.map((command) => `- ${command}`) : ['- Record why no deterministic command applies.']),
  '',
  '## Success Rubric',
  '',
  ...task.successRubric.map((item) => `- ${item}`),
  '',
  '## Result Capture',
  '',
  'When finished, fill in the adjacent result.json file with elapsed time, changed files, validation status, retry count, token estimates if available, and notes.',
  '',
].join('\n')

const createPendingResult = (
  taskId: string,
  condition: BenchmarkConditionName,
  contextEstimatedTokens: number,
): BenchmarkConditionResult => ({
  taskId,
  condition,
  status: 'pending',
  inputEstimatedTokens: condition === 'agentctx-context' ? contextEstimatedTokens : 0,
  outputEstimatedTokens: 0,
  retryCount: 0,
  checksPassed: false,
  evaluatorScore: 0,
  changedFiles: [],
  notes: ['Replace this template after the agent run completes.'],
})

export const prepareBenchmarkRun = async (input: {
  suite: BenchmarkSuite
  repoDir: string
  outDir: string
}): Promise<BenchmarkRunSummary> => {
  const errors = validateBenchmarkSuite(input.suite)
  if (errors.length) throw new Error(`Invalid benchmark suite:\n- ${errors.join('\n- ')}`)

  const contextEstimatedTokens = await estimateAgentCtxContextTokens(input.repoDir)
  await ensureDir(input.outDir)
  await fs.rm(path.join(input.outDir, 'tasks'), { recursive: true, force: true })
  await fs.writeFile(path.join(input.outDir, 'suite.json'), JSON.stringify(input.suite, null, 2) + '\n', 'utf8')

  for (const task of input.suite.tasks) {
    for (const condition of input.suite.conditions) {
      const conditionDir = path.join(input.outDir, 'tasks', task.id, condition)
      await ensureDir(conditionDir)
      await fs.writeFile(
        path.join(conditionDir, 'prompt.md'),
        renderConditionPrompt(input.suite, task, condition, contextEstimatedTokens),
        'utf8',
      )
      await fs.writeFile(
        path.join(conditionDir, 'result.json'),
        JSON.stringify(createPendingResult(task.id, condition, contextEstimatedTokens), null, 2) + '\n',
        'utf8',
      )
    }
  }

  const summary = await summarizeBenchmarkRun({ suite: input.suite, runDir: input.outDir, contextEstimatedTokens })
  await fs.writeFile(path.join(input.outDir, 'report.md'), renderBenchmarkReportMarkdown(summary), 'utf8')
  await fs.writeFile(path.join(input.outDir, 'report.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8')
  return summary
}

const readResult = async (
  runDir: string,
  taskId: string,
  condition: BenchmarkConditionName,
): Promise<BenchmarkConditionResult | undefined> => {
  const filePath = path.join(runDir, 'tasks', taskId, condition, 'result.json')
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(filePath, 'utf8'))
    if (!isObject(parsed)) return undefined
    return {
      taskId,
      condition,
      status: parsed.status === 'pass' || parsed.status === 'fail' || parsed.status === 'pending' ? parsed.status : 'pending',
      ...(typeof parsed.elapsedMs === 'number' ? { elapsedMs: parsed.elapsedMs } : {}),
      ...(typeof parsed.inputEstimatedTokens === 'number' ? { inputEstimatedTokens: parsed.inputEstimatedTokens } : {}),
      ...(typeof parsed.outputEstimatedTokens === 'number' ? { outputEstimatedTokens: parsed.outputEstimatedTokens } : {}),
      ...(typeof parsed.retryCount === 'number' ? { retryCount: parsed.retryCount } : {}),
      ...(typeof parsed.checksPassed === 'boolean' ? { checksPassed: parsed.checksPassed } : {}),
      ...(typeof parsed.evaluatorScore === 'number' ? { evaluatorScore: parsed.evaluatorScore } : {}),
      changedFiles: stringArray(parsed.changedFiles),
      notes: stringArray(parsed.notes),
    }
  } catch {
    return undefined
  }
}

const readContextEstimateFromPrompts = async (runDir: string): Promise<number> => {
  try {
    const tasksDir = path.join(runDir, 'tasks')
    const taskIds = await fs.readdir(tasksDir)

    for (const taskId of taskIds.sort((a, b) => a.localeCompare(b))) {
      const prompt = await readTextIfExists(path.join(tasksDir, taskId, 'agentctx-context', 'prompt.md'))
      const match = prompt.match(/Estimated generated context available:\s*(\d+)\s*tokens/i)
      if (match?.[1]) return Number(match[1])
    }
  } catch {
    return 0
  }

  return 0
}

const readExistingContextEstimate = async (runDir: string): Promise<number> => {
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(path.join(runDir, 'report.json'), 'utf8'))
    const fromReport = isObject(parsed) && typeof parsed.contextEstimatedTokens === 'number'
      ? parsed.contextEstimatedTokens
      : 0
    if (fromReport > 0) return fromReport
  } catch {
    // Fall back to the prompt metadata below.
  }

  return readContextEstimateFromPrompts(runDir)
}

const classifyComparison = (
  noContext: BenchmarkConditionResult | undefined,
  agentctxContext: BenchmarkConditionResult | undefined,
): Pick<BenchmarkComparison, 'outcome' | 'rationale'> => {
  if (!noContext || !agentctxContext || noContext.status === 'pending' || agentctxContext.status === 'pending') {
    return { outcome: 'inconclusive', rationale: 'Both conditions must be completed before comparison.' }
  }

  if (noContext.status !== 'pass' && agentctxContext.status === 'pass') {
    return { outcome: 'helped', rationale: 'AgentCtx condition passed where no-context did not.' }
  }

  if (noContext.status === 'pass' && agentctxContext.status !== 'pass') {
    return { outcome: 'hurt', rationale: 'No-context passed where AgentCtx condition did not.' }
  }

  const noScore = noContext.evaluatorScore ?? 0
  const ctxScore = agentctxContext.evaluatorScore ?? 0
  const noTime = noContext.elapsedMs ?? Number.POSITIVE_INFINITY
  const ctxTime = agentctxContext.elapsedMs ?? Number.POSITIVE_INFINITY
  const noTokens = (noContext.inputEstimatedTokens ?? 0) + (noContext.outputEstimatedTokens ?? 0)
  const ctxTokens = (agentctxContext.inputEstimatedTokens ?? 0) + (agentctxContext.outputEstimatedTokens ?? 0)

  if (ctxScore > noScore || ctxTime < noTime && ctxScore >= noScore) {
    return { outcome: 'helped', rationale: 'AgentCtx had a stronger evaluator score or equal quality with lower elapsed time.' }
  }

  if (ctxScore < noScore || ctxTokens > noTokens * 1.5 && ctxScore <= noScore) {
    return { outcome: 'hurt', rationale: 'AgentCtx had a weaker score or materially higher token usage without quality gain.' }
  }

  return { outcome: 'neutral', rationale: 'Both conditions produced similar measured outcomes.' }
}

export const summarizeBenchmarkRun = async (input: {
  suite: BenchmarkSuite
  runDir: string
  contextEstimatedTokens?: number
}): Promise<BenchmarkRunSummary> => {
  const contextEstimatedTokens = input.contextEstimatedTokens ?? await readExistingContextEstimate(input.runDir)
  const comparisons: BenchmarkComparison[] = []

  for (const task of input.suite.tasks) {
    const noContext = await readResult(input.runDir, task.id, 'no-context')
    const agentctxContext = await readResult(input.runDir, task.id, 'agentctx-context')
    const classification = classifyComparison(noContext, agentctxContext)
    comparisons.push({
      taskId: task.id,
      ...classification,
      ...(noContext ? { noContext } : {}),
      ...(agentctxContext ? { agentctxContext } : {}),
    })
  }

  return {
    suite: input.suite,
    runDir: input.runDir,
    contextEstimatedTokens,
    comparisons,
  }
}

const average = (values: readonly number[]): number =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

export const renderBenchmarkReportMarkdown = (summary: BenchmarkRunSummary): string => {
  const completed = summary.comparisons.filter((comparison) =>
    comparison.noContext?.status !== 'pending' && comparison.agentctxContext?.status !== 'pending')
  const helped = summary.comparisons.filter((comparison) => comparison.outcome === 'helped').length
  const hurt = summary.comparisons.filter((comparison) => comparison.outcome === 'hurt').length
  const neutral = summary.comparisons.filter((comparison) => comparison.outcome === 'neutral').length
  const inconclusive = summary.comparisons.filter((comparison) => comparison.outcome === 'inconclusive').length

  const elapsedDeltas = completed
    .map((comparison) => (comparison.noContext?.elapsedMs ?? 0) - (comparison.agentctxContext?.elapsedMs ?? 0))
    .filter((value) => Number.isFinite(value))
  const scoreDeltas = completed
    .map((comparison) => (comparison.agentctxContext?.evaluatorScore ?? 0) - (comparison.noContext?.evaluatorScore ?? 0))
  const tokenDeltas = completed
    .map((comparison) =>
      ((comparison.agentctxContext?.inputEstimatedTokens ?? 0) + (comparison.agentctxContext?.outputEstimatedTokens ?? 0))
      - ((comparison.noContext?.inputEstimatedTokens ?? 0) + (comparison.noContext?.outputEstimatedTokens ?? 0)))

  const lines = [
    '# AgentCtx Benchmark Report',
    '',
    `Suite: ${summary.suite.title}`,
    `Repo profile: ${summary.suite.repoProfile}`,
    `Run directory: ${summary.runDir}`,
    `Generated AgentCtx context estimate: ${summary.contextEstimatedTokens} tokens`,
    '',
    '## Adoption Metrics',
    '',
    `- Completed task comparisons: ${completed.length}/${summary.comparisons.length}`,
    `- Helped / hurt / neutral / inconclusive: ${helped} / ${hurt} / ${neutral} / ${inconclusive}`,
    `- Average evaluator score delta: ${average(scoreDeltas).toFixed(2)} points`,
    `- Average time saved: ${Math.round(average(elapsedDeltas))}ms`,
    `- Average token delta: ${Math.round(average(tokenDeltas))} estimated tokens`,
    '',
    '## Task Comparisons',
    '',
  ]

  for (const comparison of summary.comparisons) {
    lines.push(
      `### ${comparison.taskId}`,
      '',
      `- outcome: ${comparison.outcome}`,
      `- rationale: ${comparison.rationale}`,
      `- no-context: ${comparison.noContext?.status ?? 'missing'}`
        + `, score ${comparison.noContext?.evaluatorScore ?? 0}`
        + `, time ${comparison.noContext?.elapsedMs ?? 0}ms`,
      `- agentctx-context: ${comparison.agentctxContext?.status ?? 'missing'}`
        + `, score ${comparison.agentctxContext?.evaluatorScore ?? 0}`
        + `, time ${comparison.agentctxContext?.elapsedMs ?? 0}ms`,
      '',
    )
  }

  lines.push(
    '## Interpretation Rule',
    '',
    'Treat this report as evidence, not a headline. AgentCtx should be adopted where it improves task success, evaluator score, time-to-completion, or token efficiency without increasing unsafe or unrelated changes.',
    '',
  )

  return lines.join('\n')
}
