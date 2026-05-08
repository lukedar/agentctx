import type { RunnerTask } from './types'

export type RunnerStep = Readonly<{
  id: string
  title: string
  instructions: string
  successCriteria: readonly string[]
  filesLikelyAffected: readonly string[]
}>

export type RunnerTaskPlan = Readonly<{
  task: RunnerTask
  steps: readonly RunnerStep[]
}>

export const sortStepsById = (steps: readonly RunnerStep[]): readonly RunnerStep[] =>
  [...steps].sort((a, b) => a.id.localeCompare(b.id))

export const createTaskPlan = (task: RunnerTask, steps: readonly RunnerStep[]): RunnerTaskPlan => ({
  task,
  steps: sortStepsById(steps),
})

export const validateTaskPlan = (plan: RunnerTaskPlan): readonly string[] => {
  const errors: string[] = []

  const ids = new Set<string>()
  for (const step of plan.steps) {
    if (!step.id.trim()) errors.push('Step id is required')
    if (ids.has(step.id)) errors.push(`Duplicate step id: ${step.id}`)
    ids.add(step.id)

    if (!step.title.trim()) errors.push(`Step ${step.id} title is required`)
    if (!step.instructions.trim()) errors.push(`Step ${step.id} instructions are required`)
  }

  return errors
}
