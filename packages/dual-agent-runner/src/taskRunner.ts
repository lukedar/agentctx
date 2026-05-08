import { promises as fs } from 'node:fs'
import path from 'node:path'

import { isPassingReview } from './scoring'
import { createBuilderPrompt, createEvaluatorPrompt } from './prompts'
import { createDefaultDecisionRecord, createGateEvaluation, runDeterministicChecks, type EvalCommandResult } from './qualityGate'
import { renderRunReportMarkdown } from './report'
import { createTaskPlan, validateTaskPlan } from './taskPlan'
import type { DecisionRecord, EvaluationResult, RunnerTask } from './types'
import type { RunnerStep, RunnerTaskPlan } from './taskPlan'

export type StepExecutionStatus = 'pending' | 'passed' | 'revising' | 'failed'

export type StepExecutionState = Readonly<{
  id: string
  title: string
  status: StepExecutionStatus
  attempts: number
  lastEvaluation?: EvaluationResult
}>

export type TaskExecutionState = Readonly<{
  version: 1
  taskId: string
  taskTitle: string
  planFile: string
  steps: readonly StepExecutionState[]
}>

export type StepRunResult = Readonly<{
  ok: boolean
  task: RunnerTask
  step: RunnerStep
  checks: readonly EvalCommandResult[]
  evaluation: EvaluationResult
  decision: DecisionRecord
  state: TaskExecutionState
  reportPath: string
  reportJsonPath: string
  builderPromptPath: string
  evaluatorPromptPath: string
}>

const ensureDir = async (dir: string): Promise<void> => {
  await fs.mkdir(dir, { recursive: true })
}

const parseStringArray = (value: unknown): readonly string[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const items = value.filter((item): item is string => typeof item === 'string')
  return items.length === value.length ? items : undefined
}

const parseRiskLevel = (value: unknown): RunnerTask['riskLevel'] | undefined =>
  value === 'low' || value === 'medium' || value === 'high' ? value : undefined

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const parseTaskPlanJson = (value: unknown): RunnerTaskPlan => {
  if (!isObject(value)) throw new Error('Invalid task plan: expected object')

  const taskValue = value.task
  const stepsValue = value.steps

  if (!isObject(taskValue)) throw new Error('Invalid task plan: missing task object')
  if (!Array.isArray(stepsValue)) throw new Error('Invalid task plan: missing steps array')

  const task: RunnerTask = {
    id: typeof taskValue.id === 'string' ? taskValue.id : '',
    title: typeof taskValue.title === 'string' ? taskValue.title : '',
    goal: typeof taskValue.goal === 'string' ? taskValue.goal : '',
    constraints: parseStringArray(taskValue.constraints) ?? [],
    successCriteria: parseStringArray(taskValue.successCriteria) ?? [],
    filesLikelyAffected: parseStringArray(taskValue.filesLikelyAffected) ?? [],
    riskLevel: parseRiskLevel(taskValue.riskLevel) ?? 'low',
  }

  const steps = stepsValue.map<RunnerStep>((stepValue) => {
    if (!isObject(stepValue)) throw new Error('Invalid task plan: each step must be an object')

    return {
      id: typeof stepValue.id === 'string' ? stepValue.id : '',
      title: typeof stepValue.title === 'string' ? stepValue.title : '',
      instructions: typeof stepValue.instructions === 'string' ? stepValue.instructions : '',
      successCriteria: parseStringArray(stepValue.successCriteria) ?? [],
      filesLikelyAffected: parseStringArray(stepValue.filesLikelyAffected) ?? [],
    }
  })

  const plan = createTaskPlan(task, steps)
  const errors = [...validateTaskPlan(plan)]
  if (!task.id.trim()) errors.unshift('Task id is required')
  if (!task.title.trim()) errors.unshift('Task title is required')
  if (!task.goal.trim()) errors.unshift('Task goal is required')

  if (errors.length > 0) {
    throw new Error(`Invalid task plan:\n- ${errors.join('\n- ')}`)
  }

  return plan
}

export const createInitialTaskExecutionState = (
  plan: RunnerTaskPlan,
  planFile: string,
): TaskExecutionState => ({
  version: 1,
  taskId: plan.task.id,
  taskTitle: plan.task.title,
  planFile,
  steps: plan.steps.map((step) => ({
    id: step.id,
    title: step.title,
    status: 'pending',
    attempts: 0,
  })),
})

const getNextPendingStepId = (state: TaskExecutionState): string | undefined =>
  state.steps.find((step) => step.status !== 'passed')?.id

const findStepIndex = (plan: RunnerTaskPlan, stepId: string): number =>
  plan.steps.findIndex((step) => step.id === stepId)

export const selectStepToRun = (
  plan: RunnerTaskPlan,
  state: TaskExecutionState,
  requestedStepId?: string,
): RunnerStep | undefined => {
  const candidateId = requestedStepId ?? getNextPendingStepId(state)
  if (!candidateId) return undefined

  const idx = findStepIndex(plan, candidateId)
  if (idx === -1) throw new Error(`Unknown step id: ${candidateId}`)

  for (let i = 0; i < idx; i++) {
    const previous = state.steps[i]
    if (previous?.status !== 'passed') {
      throw new Error(`Cannot run step ${candidateId} before step ${previous?.id ?? i} passes`)
    }
  }

  return plan.steps[idx]
}

const buildStepTask = (task: RunnerTask, step: RunnerStep): RunnerTask => ({
  id: `${task.id}:${step.id}`,
  title: `${task.title} / ${step.id} ${step.title}`,
  goal: step.instructions,
  constraints: [...task.constraints, `Only complete step ${step.id} before moving to the next step.`],
  successCriteria: [...task.successCriteria, ...step.successCriteria],
  filesLikelyAffected: step.filesLikelyAffected.length > 0 ? step.filesLikelyAffected : task.filesLikelyAffected,
  riskLevel: task.riskLevel,
})

const updateStateForStep = (
  state: TaskExecutionState,
  step: RunnerStep,
  evaluation: EvaluationResult,
): TaskExecutionState => ({
  ...state,
  steps: state.steps.map((entry) => {
    if (entry.id !== step.id) return entry

    return {
      ...entry,
      attempts: entry.attempts + 1,
      status:
        evaluation.status === 'pass'
          ? 'passed'
          : evaluation.status === 'revise'
            ? 'revising'
            : 'failed',
      lastEvaluation: evaluation,
    }
  }),
})

const getTaskDir = (cwd: string, taskId: string): string =>
  path.join(cwd, '.dual-agent-runner', 'tasks', taskId)

const createStepDecision = (task: RunnerTask, step: RunnerStep): DecisionRecord =>
  createDefaultDecisionRecord({
    taskId: `${task.id}:${step.id}`,
    decision: `Implement and evaluate step ${step.id}: ${step.title}`,
    reason: 'Every meaningful change must pass the dual-agent gate before the task can advance.',
    filesAffected: step.filesLikelyAffected,
    risks: [
      'A passing deterministic gate does not guarantee the step is semantically complete.',
      'Skipping the ordered plan would make the audit trail incomplete.',
    ],
    alternativesConsidered: [
      'Implement multiple plan steps before running evaluation',
      'Run one final evaluation only after the whole task is complete',
    ],
  })

export const loadTaskPlanFromFile = async (filePath: string): Promise<RunnerTaskPlan> => {
  const raw = await fs.readFile(filePath, 'utf8')
  return parseTaskPlanJson(JSON.parse(raw) as unknown)
}

export const readTaskExecutionState = async (
  filePath: string,
): Promise<TaskExecutionState | undefined> => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as TaskExecutionState
  } catch {
    return undefined
  }
}

export const writeTaskExecutionState = async (
  filePath: string,
  state: TaskExecutionState,
): Promise<void> => {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, JSON.stringify(state, null, 2) + '\n', 'utf8')
}

export const createTaskPlanTemplate = (): RunnerTaskPlan => {
  return createTaskPlan(
    {
      id: 'task-1',
      title: 'Describe the task',
      goal: 'What outcome are we trying to achieve?',
      constraints: ['local-first', 'deterministic outputs'],
      successCriteria: ['Each implementation step passes the dual-agent evaluation gate'],
      filesLikelyAffected: [],
      riskLevel: 'low',
    },
    [
      {
        id: 'step-01',
        title: 'Define the first implementation slice',
        instructions: 'Describe the smallest useful change to make first.',
        successCriteria: ['The first slice is implemented and validated'],
        filesLikelyAffected: [],
      },
      {
        id: 'step-02',
        title: 'Define the second implementation slice',
        instructions: 'Describe the next change that depends on step-01.',
        successCriteria: ['The second slice is implemented and validated'],
        filesLikelyAffected: [],
      },
    ],
  )
}

export const runTaskPlanStep = async (
  input: {
    cwd: string
    planFile: string
    stepId?: string
    outDir?: string
    check?: boolean
  },
  deps?: {
    runChecks?: (cwd: string) => Promise<readonly EvalCommandResult[]>
  },
): Promise<StepRunResult> => {
  const plan = await loadTaskPlanFromFile(input.planFile)
  const taskDir = input.outDir ?? getTaskDir(input.cwd, plan.task.id)
  const statePath = path.join(taskDir, 'state.json')
  const planCopyPath = path.join(taskDir, 'plan.json')

  const existingState = await readTaskExecutionState(statePath)
  const state = existingState ?? createInitialTaskExecutionState(plan, input.planFile)
  const step = selectStepToRun(plan, state, input.stepId)
  if (!step) {
    throw new Error(`All task steps already passed for ${plan.task.id}`)
  }

  const stepTask = buildStepTask(plan.task, step)
  const nextStep = plan.steps[findStepIndex(plan, step.id) + 1]
  const approvedNextStep = nextStep
    ? `Proceed to ${nextStep.id}: ${nextStep.title}`
    : 'All plan steps have passed. Close out the task.'

  const checks = await (deps?.runChecks ?? runDeterministicChecks)(input.cwd)
  const evaluation = createGateEvaluation({
    taskId: stepTask.id,
    checks,
    approvedNextStep,
  })

  const decision = createStepDecision(plan.task, step)
  const nextState = updateStateForStep(state, step, evaluation)

  await ensureDir(taskDir)
  await ensureDir(path.join(taskDir, 'steps'))
  await fs.writeFile(planCopyPath, JSON.stringify(plan, null, 2) + '\n', 'utf8')
  await writeTaskExecutionState(statePath, nextState)

  const builderPromptPath = path.join(taskDir, 'builder.md')
  const evaluatorPromptPath = path.join(taskDir, 'evaluator.md')
  await fs.writeFile(builderPromptPath, createBuilderPrompt(stepTask) + '\n', 'utf8')
  await fs.writeFile(evaluatorPromptPath, createEvaluatorPrompt(stepTask) + '\n', 'utf8')

  const report = renderRunReportMarkdown({
    task: stepTask,
    decisions: [decision],
    evaluations: [evaluation],
  })

  const reportPath = path.join(taskDir, 'steps', `${step.id}.md`)
  const reportJsonPath = path.join(taskDir, 'steps', `${step.id}.json`)

  await fs.writeFile(reportPath, report + '\n', 'utf8')
  await fs.writeFile(
    reportJsonPath,
    JSON.stringify(
      {
        version: 1,
        task: stepTask,
        step,
        decision,
        checks,
        evaluation,
        state: nextState,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  )

  if (input.check && !isPassingReview(evaluation)) {
    process.exitCode = 1
  }

  return {
    ok: isPassingReview(evaluation),
    task: stepTask,
    step,
    checks,
    evaluation,
    decision,
    state: nextState,
    reportPath,
    reportJsonPath,
    builderPromptPath,
    evaluatorPromptPath,
  }
}
