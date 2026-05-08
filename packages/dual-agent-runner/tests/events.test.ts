import { describe, expect, it } from 'vitest'
import { createInitialRunnerUiModel, reduceRunnerUiModel } from '../src/events'

describe('reduceRunnerUiModel', () => {
  it('transitions from idle to running on task.started', () => {
    const model = createInitialRunnerUiModel({ taskId: 't1', title: 'Test' })
    const next = reduceRunnerUiModel(model, {
      id: 'e1',
      taskId: 't1',
      type: 'task.started',
      message: 'start',
      timestampMs: 1000,
    })

    expect(next.status).toBe('running')
    expect(next.events).toHaveLength(1)
  })

  it('creates/activates a step on step.started', () => {
    const model = createInitialRunnerUiModel({ taskId: 't1', title: 'Test' })
    const running = reduceRunnerUiModel(model, {
      id: 'e1',
      taskId: 't1',
      type: 'task.started',
      message: 'start',
      timestampMs: 1000,
    })

    const next = reduceRunnerUiModel(running, {
      id: 'e2',
      taskId: 't1',
      stepId: 's1',
      type: 'step.started',
      message: 'step',
      timestampMs: 1500,
    })

    expect(next.activeStepId).toBe('s1')
    expect(next.steps[0]?.status).toBe('active')
  })
})
