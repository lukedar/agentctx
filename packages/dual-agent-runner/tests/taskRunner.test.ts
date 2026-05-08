import { describe, expect, it } from 'vitest'

import {
  createInitialTaskExecutionState,
  createTaskPlanTemplate,
  parseTaskPlanJson,
  selectStepToRun,
} from '../src/taskRunner'

describe('taskRunner', () => {
  it('parses a valid task plan', () => {
    const template = createTaskPlanTemplate()
    const parsed = parseTaskPlanJson(template)

    expect(parsed.task.id).toBe(template.task.id)
    expect(parsed.steps).toHaveLength(2)
  })

  it('selects the first pending step by default', () => {
    const plan = createTaskPlanTemplate()
    const state = createInitialTaskExecutionState(plan, '/tmp/plan.json')

    expect(selectStepToRun(plan, state)?.id).toBe('step-01')
  })

  it('blocks later steps until earlier steps pass', () => {
    const plan = createTaskPlanTemplate()
    const state = createInitialTaskExecutionState(plan, '/tmp/plan.json')

    expect(() => selectStepToRun(plan, state, 'step-02')).toThrow(/Cannot run step step-02/)
  })

  it('allows the next step after the previous one passes', () => {
    const plan = createTaskPlanTemplate()
    const state = {
      ...createInitialTaskExecutionState(plan, '/tmp/plan.json'),
      steps: [
        {
          id: 'step-01',
          title: 'Define the first implementation slice',
          status: 'passed' as const,
          attempts: 1,
        },
        {
          id: 'step-02',
          title: 'Define the second implementation slice',
          status: 'pending' as const,
          attempts: 0,
        },
      ],
    }

    expect(selectStepToRun(plan, state)?.id).toBe('step-02')
  })
})
