import { promises as fs } from 'node:fs'
import path from 'node:path'

import { isPassingReview } from './scoring'
import { renderRunReportMarkdown } from './report'
import { createDefaultDecisionRecord, createDefaultTask, createGateEvaluation, runDeterministicChecks } from './qualityGate'
import { createTaskPlanTemplate, runTaskPlanStep } from './taskRunner'
import type { RunnerTask } from './types'

const parseArgs = (argv: readonly string[]): {
  cmd: string
  subcmd: string | undefined
  cwd: string | undefined
  taskId: string | undefined
  taskFile: string | undefined
  planFile: string | undefined
  stepId: string | undefined
  out: string | undefined
  outJson: string | undefined
  outDir: string | undefined
  check: boolean
} => {
  const [cmd = 'help', maybeSubcmd, ...rest] = argv

  const out: Record<string, string | boolean> = {}
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]
    if (a === '--check') out.check = true
    else if (a === '--cwd') out.cwd = rest[++i] ?? ''
    else if (a === '--task-id') out['task-id'] = rest[++i] ?? ''
    else if (a === '--task-file') out['task-file'] = rest[++i] ?? ''
    else if (a === '--plan-file') out['plan-file'] = rest[++i] ?? ''
    else if (a === '--step') out.step = rest[++i] ?? ''
    else if (a === '--out') out.out = rest[++i] ?? ''
    else if (a === '--out-json') out['out-json'] = rest[++i] ?? ''
    else if (a === '--out-dir') out['out-dir'] = rest[++i] ?? ''
  }

  const norm = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

  return {
    cmd,
    subcmd: maybeSubcmd && !maybeSubcmd.startsWith('-') ? maybeSubcmd : undefined,
    cwd: norm(out.cwd),
    taskId: norm(out['task-id']),
    taskFile: norm(out['task-file']),
    planFile: norm(out['plan-file']),
    stepId: norm(out.step),
    out: norm(out.out),
    outJson: norm(out['out-json']),
    outDir: norm(out['out-dir']),
    check: Boolean(out.check),
  }
}

const help = (): void => {
  // eslint-disable-next-line no-console
  console.log(`dual-agent-runner\n\nUsage:\n  dar eval [--cwd <dir>] [--task-id <id>] [--task-file <json>] [--out <file.md>] [--out-json <file.json>] [--check]\n  dar task template\n  dar plan template\n  dar plan eval --plan-file <json> [--step <id>] [--cwd <dir>] [--out-dir <dir>] [--check]\n  dar prompt\n\nCommands:\n  eval            Run deterministic evaluation gate (typecheck/test/build) + write markdown & JSON reports\n  task template   Print a RunnerTask JSON template to stdout\n  plan template   Print a RunnerTaskPlan JSON template to stdout\n  plan eval       Evaluate the next or named task-plan step and persist step reports/state\n  prompt          Print the reusable dual-agent execution prompt template\n`)
}

const ensureDir = async (dir: string): Promise<void> => {
  await fs.mkdir(dir, { recursive: true })
}

const main = async (): Promise<void> => {
  const args = parseArgs(process.argv.slice(2))

  if (args.cmd === 'help' || args.cmd === '--help' || args.cmd === '-h') {
    help()
    return
  }

  if (args.cmd === 'prompt') {
    // eslint-disable-next-line no-console
    console.log(`You are executing the AgentCtx dual-agent implementation workflow.\n\nAgent 1 is the Builder Agent.\nAgent 2 is the Evaluator Agent.\n\nAgent 1 must implement the requested task.\nAgent 2 must review all decisions and score the result using:\n- correctness\n- performance\n- tokenUsage\n- security\n- usability\n- readability\n- testability\n\nProject principles:\n- Functional programming style\n- Simple composable modules\n- Deterministic output\n- Local-first\n- No unnecessary dependencies\n- No unsafe filesystem writes\n- Never expose secrets in generated context\n\nRequired workflow:\n1) Builder explains approach\n2) Evaluator reviews + identifies risks\n3) Builder implements\n4) Evaluator scores\n5) Builder fixes below threshold\n6) Final output includes a scorecard + remaining risks\n`)
    return
  }

  if (args.cmd === 'task' && args.subcmd === 'template') {
    const template: RunnerTask = createDefaultTask('task-1')
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(template, null, 2))
    return
  }

  if (args.cmd === 'plan' && args.subcmd === 'template') {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(createTaskPlanTemplate(), null, 2))
    return
  }

  if (args.cmd === 'plan' && args.subcmd === 'eval') {
    if (!args.planFile) throw new Error('Missing required --plan-file <json>')

    const cwd = args.cwd ? path.resolve(process.cwd(), args.cwd) : process.cwd()
    const result = await runTaskPlanStep({
      cwd,
      planFile: path.resolve(process.cwd(), args.planFile),
      ...(args.stepId ? { stepId: args.stepId } : {}),
      ...(args.outDir ? { outDir: path.resolve(process.cwd(), args.outDir) } : {}),
      ...(args.check ? { check: true } : {}),
    })

    // eslint-disable-next-line no-console
    console.log(`\nStep report written: ${result.reportPath}`)
    // eslint-disable-next-line no-console
    console.log(`Step report written: ${result.reportJsonPath}`)
    // eslint-disable-next-line no-console
    console.log(`Builder prompt: ${result.builderPromptPath}`)
    // eslint-disable-next-line no-console
    console.log(`Evaluator prompt: ${result.evaluatorPromptPath}`)
    // eslint-disable-next-line no-console
    console.log(
      `Step ${result.step.id} status: ${result.evaluation.status.toUpperCase()} (avg ${result.evaluation.average.toFixed(2)}/5)`,
    )
    if (args.check && !result.ok) process.exitCode = 1
    return
  }

  if (args.cmd !== 'eval') {
    help()
    process.exitCode = 1
    return
  }

  const cwd = args.cwd ? path.resolve(process.cwd(), args.cwd) : process.cwd()
  const taskId = args.taskId ?? 'dev-eval'

  const outPath = args.out
    ? path.resolve(process.cwd(), args.out)
    : path.join(cwd, '.dual-agent-runner', 'reports', `${taskId}.md`)

  const outJsonPath = args.outJson
    ? path.resolve(process.cwd(), args.outJson)
    : outPath.replace(/\.md$/i, '.json')

  const defaultTask: RunnerTask = createDefaultTask(taskId)

  const readTaskFromFile = async (filePath: string): Promise<RunnerTask> => {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as Partial<RunnerTask>

    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid task file (expected JSON object)')
    if (!parsed.id || typeof parsed.id !== 'string') throw new Error('Invalid task file: missing id')
    if (!parsed.title || typeof parsed.title !== 'string') throw new Error('Invalid task file: missing title')
    if (!parsed.goal || typeof parsed.goal !== 'string') throw new Error('Invalid task file: missing goal')

    return {
      id: parsed.id,
      title: parsed.title,
      goal: parsed.goal,
      constraints: Array.isArray(parsed.constraints) ? (parsed.constraints.filter((x): x is string => typeof x === 'string') as readonly string[]) : [],
      successCriteria: Array.isArray(parsed.successCriteria)
        ? (parsed.successCriteria.filter((x): x is string => typeof x === 'string') as readonly string[])
        : [],
      filesLikelyAffected: Array.isArray(parsed.filesLikelyAffected)
        ? (parsed.filesLikelyAffected.filter((x): x is string => typeof x === 'string') as readonly string[])
        : [],
      riskLevel: parsed.riskLevel === 'high' || parsed.riskLevel === 'medium' || parsed.riskLevel === 'low' ? parsed.riskLevel : 'low',
    }
  }

  const task: RunnerTask = args.taskFile
    ? await readTaskFromFile(path.resolve(process.cwd(), args.taskFile))
    : defaultTask

  const results = await runDeterministicChecks(cwd)
  const evaluation = createGateEvaluation({
    taskId,
    checks: results,
    approvedNextStep: 'Proceed',
  })

  const decisions = [
    createDefaultDecisionRecord({
      taskId,
      decision: 'Run deterministic quality gate as Evaluator input',
      reason: 'Ensures every change is evaluated consistently (typecheck/test/build) before proceeding.',
      filesAffected: task.filesLikelyAffected,
    }),
  ]

  const report = renderRunReportMarkdown({
    task,
    decisions,
    evaluations: [evaluation],
  })

  await ensureDir(path.dirname(outPath))
  await fs.writeFile(outPath, report + '\n', 'utf8')

  const json = {
    version: 1,
    task,
    checks: results,
    evaluation,
  }
  await fs.writeFile(outJsonPath, JSON.stringify(json, null, 2) + '\n', 'utf8')

  // eslint-disable-next-line no-console
  console.log(`\nReport written: ${outPath}`)
  // eslint-disable-next-line no-console
  console.log(`Report written: ${outJsonPath}`)
  // eslint-disable-next-line no-console
  console.log(`Evaluation status: ${evaluation.status.toUpperCase()} (avg ${evaluation.average.toFixed(2)}/5)`)

  if (args.check && !isPassingReview(evaluation)) process.exitCode = 1
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exitCode = 1
})
