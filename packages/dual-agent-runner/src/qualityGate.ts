import { spawn } from 'node:child_process'

import { createEvaluationResult } from './scoring'
import type { DecisionRecord, EvaluationResult, ReviewScore, RunnerTask } from './types'

export type EvalCommandResult = Readonly<{
  label: string
  ok: boolean
  code: number | null
}>

export const runCommandCheck = async (
  cmd: string,
  args: readonly string[],
  cwd: string,
  label: string,
): Promise<EvalCommandResult> => {
  return await new Promise((resolve) => {
    const child = spawn(cmd, [...args], {
      cwd,
      stdio: 'inherit',
      env: process.env,
    })

    child.on('close', (code) => {
      resolve({ label, ok: code === 0, code })
    })
  })
}

export const runDeterministicChecks = async (cwd: string): Promise<readonly EvalCommandResult[]> => {
  const results: EvalCommandResult[] = []

  results.push(await runCommandCheck('pnpm', ['-r', 'typecheck'], cwd, 'typecheck'))
  results.push(await runCommandCheck('pnpm', ['-r', 'test'], cwd, 'test'))
  results.push(await runCommandCheck('pnpm', ['-r', 'build'], cwd, 'build'))

  return results
}

export const createDefaultDecisionRecord = (input: {
  taskId: string
  decision: string
  reason: string
  filesAffected: readonly string[]
  risks?: readonly string[]
  alternativesConsidered?: readonly string[]
}): DecisionRecord => ({
  taskId: input.taskId,
  decision: input.decision,
  reason: input.reason,
  filesAffected: input.filesAffected,
  alternativesConsidered: input.alternativesConsidered ?? [
    'Skip the dual-agent gate and rely on manual review only',
    'Run checks only once at the end of the full task',
  ],
  risks: input.risks ?? ['Automated checks do not replace semantic review of the implementation.'],
  expectedEffects: {
    performance: 'Runs deterministic checks on every gated step before continuing.',
    tokenUsage: 'Encourages smaller, reviewable steps and less wasted iteration.',
    usability: 'Creates a clear pass/revise/fail signal for each step.',
    readability: 'Keeps implementation slices small and auditable.',
    security: 'Blocks unsafe or broken states from being treated as complete.',
  },
})

export const createGateEvaluation = (input: {
  taskId: string
  checks: readonly EvalCommandResult[]
  approvedNextStep: string
}): EvaluationResult => {
  const blockingIssues = input.checks
    .filter((result) => !result.ok)
    .map((result) => `${result.label} failed (exit ${result.code ?? 'null'})`)

  const requiredChanges =
    blockingIssues.length > 0
      ? ['Fix failing checks for the current step, then re-run the dual-agent evaluation.']
      : []

  const testResult = input.checks.find((result) => result.label === 'test')

  const scores: ReviewScore = {
    correctness: blockingIssues.length === 0 ? 5 : 1,
    testability: testResult?.ok ? 4 : 1,
    security: 4,
    performance: 4,
    tokenUsage: 4,
    usability: 4,
    readability: 4,
    simplicity: 4,
    maintainability: blockingIssues.length === 0 ? 4 : 2,
  }

  return createEvaluationResult({
    taskId: input.taskId,
    scores,
    blockingIssues,
    requiredChanges,
    approvedNextStep: blockingIssues.length > 0
      ? 'Revise the current step and re-run evaluation'
      : input.approvedNextStep,
  })
}

export const createDefaultTask = (taskId: string): RunnerTask => ({
  id: taskId,
  title: 'Development evaluation gate',
  goal: 'Evaluate current workspace changes using the dual-agent rubric and deterministic checks.',
  constraints: ['local-first', 'deterministic outputs', 'no network calls'],
  successCriteria: [
    'All typechecks pass',
    'All tests pass',
    'All builds pass',
    'Evaluation status is PASS',
  ],
  filesLikelyAffected: [],
  riskLevel: 'low',
})
