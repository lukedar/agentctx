import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  calculateCoverageByContextPoint,
  compareBenchmarkResults,
  createBenchmarkRunPlan,
  createTokenSummary,
  parseBenchmarkSuiteFile,
  parseBenchmarkTaskFile,
  prepareBenchmarkRun,
  rebuildBenchmarkReport,
  runBenchmarkTasks,
  slugify,
  type BenchmarkConditionResult,
} from '../src/benchmark'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const mkRepo = async (): Promise<string> => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'agentctx-benchmark-repo-'))
  await fs.mkdir(path.join(repo, '.agentctx', 'context'), { recursive: true })
  await fs.writeFile(
    path.join(repo, '.agentctx', 'context', 'frontend.md'),
    '# Frontend\n\nAngular routes, components, tests, and UI configuration.\n',
    'utf8',
  )
  return repo
}

const completedResult = (overrides: Partial<BenchmarkConditionResult>): BenchmarkConditionResult => ({
  condition: 'no-context',
  status: 'completed',
  elapsedMs: 100_000,
  inputTokens: 1_000,
  outputTokens: 1_000,
  totalTokens: 2_000,
  agentCompute: {
    retries: 1,
    toolCalls: 5,
  },
  changedFiles: [],
  checksPassed: true,
  validationNotes: [],
  evaluatorScore: 4,
  scopeMisses: [],
  ...overrides,
})

describe('benchmark', () => {
  it('slugifies task and block names deterministically', () => {
    expect(slugify('Update Research Allocation Title')).toBe('update-research-allocation-title')
    expect(slugify('  !!!  ')).toBe('task')
  })

  it('prepares no-context and AgentCtx context run packs for a medium WebApp task', async () => {
    const repo = await mkRepo()
    const prepared = await prepareBenchmarkRun({
      repoDir: repo,
      ctxPoint: 'webapp-frontend',
      ctxBlock: 'WebApp',
      ctxFile: path.join(repo, '.agentctx', 'context', 'frontend.md'),
      taskName: 'Refactor research view option initialisation',
      taskPrompt:
        'Extract research page view-option initialisation into a named method and update static checks for the refactor.',
    })

    expect(prepared.benchmark.ctxPoint).toBe('webapp-frontend')
    expect(prepared.benchmark.ctxBlock).toBe('WebApp')
    expect(prepared.benchmark.taskId).toBe('refactor-research-view-option-initialisation')
    expect(prepared.benchmark.contextFile).toBe(path.join(repo, '.agentctx', 'context', 'frontend.md'))
    expect(prepared.benchmark.prompts['no-context']).toBe('no-context/prompt.md')
    expect(prepared.benchmark.results['agentctx-context']).toBe('agentctx-context/result.json')

    const noContextPrompt = await fs.readFile(path.join(prepared.runDir, 'no-context', 'prompt.md'), 'utf8')
    const agentctxPrompt = await fs.readFile(path.join(prepared.runDir, 'agentctx-context', 'prompt.md'), 'utf8')
    const noContextResult = JSON.parse(
      await fs.readFile(path.join(prepared.runDir, 'no-context', 'result.json'), 'utf8'),
    ) as BenchmarkConditionResult

    expect(noContextPrompt).toContain('Do not use generated AgentCtx files.')
    expect(noContextPrompt).toContain('Refactor research view option initialisation')
    expect(agentctxPrompt).toContain('## Generated CtxBlock')
    expect(agentctxPrompt).toContain('Angular routes, components')
    expect(noContextResult.status).toBe('pending')
    expect(noContextResult.inputTokens).toBeGreaterThan(0)
  })

  it('fails clearly when the requested CtxBlock has not been generated', async () => {
    const repo = await mkRepo()

    await expect(
      prepareBenchmarkRun({
        repoDir: repo,
        ctxBlock: 'api',
        taskName: 'API task',
        taskPrompt: 'Change an endpoint.',
      }),
    ).rejects.toThrow(/Missing CtxBlock file/)
  })

  it('can use a custom context file while naming the tested CtxBlock separately', async () => {
    const repo = await mkRepo()
    const prepared = await prepareBenchmarkRun({
      repoDir: repo,
      ctxBlock: 'WebApp',
      ctxFile: path.join(repo, '.agentctx', 'context', 'frontend.md'),
      taskName: 'Refactor research page',
      taskPrompt: 'Refactor the research page.',
    })

    expect(prepared.benchmark.ctxBlock).toBe('WebApp')
    expect(prepared.benchmark.contextFile).toContain('/frontend.md')
  })

  it('compares helped, hurt, neutral, and inconclusive outcomes', () => {
    expect(
      compareBenchmarkResults(
        completedResult({ condition: 'no-context', evaluatorScore: 3, elapsedMs: 120_000, totalTokens: 4_000 }),
        completedResult({ condition: 'agentctx-context', evaluatorScore: 4, elapsedMs: 80_000, totalTokens: 2_500 }),
      ).outcome,
    ).toBe('helped')

    expect(
      compareBenchmarkResults(
        completedResult({ condition: 'no-context', evaluatorScore: 4, elapsedMs: 80_000, totalTokens: 2_500 }),
        completedResult({ condition: 'agentctx-context', evaluatorScore: 3, elapsedMs: 120_000, totalTokens: 4_000 }),
      ).outcome,
    ).toBe('hurt')

    expect(
      compareBenchmarkResults(
        completedResult({ condition: 'no-context', evaluatorScore: 4, elapsedMs: 100_000, totalTokens: 2_000 }),
        completedResult({ condition: 'agentctx-context', evaluatorScore: 4, elapsedMs: 100_000, totalTokens: 2_000 }),
      ).outcome,
    ).toBe('neutral')

    expect(
      compareBenchmarkResults(
        completedResult({ condition: 'no-context', status: 'pending' }),
        completedResult({ condition: 'agentctx-context' }),
      ).outcome,
    ).toBe('inconclusive')
  })

  it('rebuilds a report from completed result files', async () => {
    const repo = await mkRepo()
    const prepared = await prepareBenchmarkRun({
      repoDir: repo,
      ctxBlock: 'frontend',
      taskName: 'Add footer totals',
      taskPrompt: 'Add totals to the instruments table footer.',
    })

    await fs.writeFile(
      path.join(prepared.runDir, 'no-context', 'result.json'),
      JSON.stringify(completedResult({ condition: 'no-context', elapsedMs: 120_000, totalTokens: 4_000, evaluatorScore: 3 }), null, 2),
      'utf8',
    )
    await fs.writeFile(
      path.join(prepared.runDir, 'agentctx-context', 'result.json'),
      JSON.stringify(
        completedResult({
          condition: 'agentctx-context',
          elapsedMs: 70_000,
          totalTokens: 2_200,
          evaluatorScore: 4,
          changedFiles: ['Source/Apps/WebApp/Quantifeed.WebApp/classic/research/research.page.component.ts'],
          agentCompute: { retries: 0, toolCalls: 3, providerLatencyMs: 70_000 },
        }),
        null,
        2,
      ),
      'utf8',
    )

    const report = await rebuildBenchmarkReport(prepared.runDir)
    const reportMarkdown = await fs.readFile(path.join(prepared.runDir, 'report.md'), 'utf8')

    expect(report.comparison.outcome).toBe('helped')
    expect(reportMarkdown).toContain('Outcome: **helped**')
    expect(reportMarkdown).toContain('(+45.0%)')
    expect(report.tokenSummary.delta).toBe(1800)
    expect(reportMarkdown).toContain('## Context Point Coverage')
  })

  it('parses mock task fixtures and creates a run plan', async () => {
    const repoRoot = path.resolve(__dirname, '../../..')
    const suitePath = path.join(repoRoot, 'bench/suites/agentctx-core-validation.md')
    const suite = await parseBenchmarkSuiteFile(suitePath)
    const tasks = await Promise.all(
      suite.tasks.map((taskPath) => parseBenchmarkTaskFile(path.resolve(path.dirname(suitePath), taskPath))),
    )
    const plan = createBenchmarkRunPlan(tasks, suite.conditions)

    expect(suite.conditions).toEqual(['no-context', 'agentctx-context'])
    expect(plan).toHaveLength(6)
    expect(plan.map((item) => item.difficulty)).toEqual(['small', 'small', 'medium', 'medium', 'complex', 'complex'])
    expect(plan.at(2)?.contextPoints).toContain('core')
    expect(plan.at(5)?.contextPoints).toEqual([
      'adapters',
      'cli',
      'core',
      'docs-agentctx',
      'dual-agent-runner',
      'targets',
    ])
  })

  it('calculates token summary and Context Point coverage states', () => {
    const tokenSummary = createTokenSummary(
      completedResult({ condition: 'no-context', totalTokens: 5000 }),
      completedResult({ condition: 'agentctx-context', totalTokens: 3000 }),
    )
    const coverage = calculateCoverageByContextPoint(
      ['core', 'cli', 'targets'],
      ['packages/core/src/index.ts', 'packages/cli/src/commands/check.ts'],
      ['packages/core/tests/index.test.ts'],
    )

    expect(tokenSummary.delta).toBe(2000)
    expect(tokenSummary.reductionPercent).toBe(40)
    expect(coverage.find((item) => item.contextPoint === 'core')?.status).toBe('covered')
    expect(coverage.find((item) => item.contextPoint === 'cli')?.status).toBe('covered')
    expect(coverage.find((item) => item.contextPoint === 'targets')?.status).toBe('missing')
  })

  it('generates JSON, Markdown, HTML, and coverage reports for the mock suite', async () => {
    const repo = await mkRepo()
    const repoRoot = path.resolve(__dirname, '../../..')
    const suitePath = path.join(repoRoot, 'bench/suites/agentctx-core-validation.md')
    const suite = await parseBenchmarkSuiteFile(suitePath)
    const tasks = await Promise.all(
      suite.tasks.map((taskPath) => parseBenchmarkTaskFile(path.resolve(path.dirname(suitePath), taskPath))),
    )

    const result = await runBenchmarkTasks(repo, tasks)
    const indexHtml = await fs.readFile(result.reportIndexPath, 'utf8')
    const reportJson = JSON.parse(
      await fs.readFile(path.join(repo, '.agentctx/bench/runs/complex-public-safe-context-validation/report.json'), 'utf8'),
    ) as { securityFindings: readonly string[]; publicSafeValidation: { checked: boolean }; coverageByContextPoint: readonly unknown[] }
    const coverageHtml = await fs.readFile(
      path.join(repo, '.agentctx/bench/runs/medium-add-context-point-coverage/coverage/index.html'),
      'utf8',
    )

    expect(result.reports).toHaveLength(6)
    expect(indexHtml).toContain('AgentCtx Bench Reports')
    expect(indexHtml).toContain('Suite Metric')
    expect(indexHtml).toContain('Context Point Coverage')
    expect(coverageHtml).toContain('Context Point')
    expect(reportJson.publicSafeValidation.checked).toBe(true)
    expect(reportJson.coverageByContextPoint.length).toBeGreaterThan(0)
  })
})
