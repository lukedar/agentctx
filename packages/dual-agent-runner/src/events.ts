import type { EvaluationResult, ReviewScore, ReviewStatus, ScoreDimension } from './types'
import type { TokenUsageMetrics } from './tokenUsage'

export type RunnerEventType =
  | 'task.started'
  | 'step.started'
  | 'builder.decision.created'
  | 'evaluator.review.created'
  | 'step.implemented'
  | 'metrics.updated'
  | 'step.completed'
  | 'task.completed'
  | 'task.failed'

export type RunnerEvent = Readonly<{
  id: string
  taskId: string
  stepId?: string
  type: RunnerEventType
  message: string
  timestampMs: number
  payload?: unknown
}>

export type RunnerUiStepStatus = 'pending' | 'active' | 'passed' | 'revising' | 'failed'

export type RunnerUiStep = Readonly<{
  id: string
  title: string
  status: RunnerUiStepStatus
  activeAgent: 'builder' | 'evaluator' | 'none'
  startedAtMs?: number
  completedAtMs?: number
  durationMs?: number
  latestDecision?: string
  latestReviewStatus?: ReviewStatus
  scores?: ReviewScore
}>

export type RunnerMetrics = Readonly<{
  durationMs: number
  filesChanged: number
  testsAdded: number
  decisionsReviewed: number
  revisionsRequested: number
  averageScore: number
  lowestScoreDimension?: ScoreDimension
  performance: Readonly<{
    scanMs?: number
    buildMs?: number
    renderMs?: number
    syncMs?: number
    totalMs: number
  }>
  tokenUsage: TokenUsageMetrics
  security: Readonly<{
    secretsRedacted: number
    blockedFilesSkipped: number
    unsafeActionsBlocked: number
  }>
}>

export type RunnerUiModel = Readonly<{
  taskId: string
  title: string
  status: 'idle' | 'running' | 'passed' | 'failed'
  activeStepId?: string
  steps: readonly RunnerUiStep[]
  metrics: RunnerMetrics
  events: readonly RunnerEvent[]
  startedAtMs?: number
}>

export const createEmptyTokenUsageMetrics = (): TokenUsageMetrics => ({
  inputEstimatedTokens: 0,
  outputEstimatedTokens: 0,
  reducedEstimatedTokens: 0,
  reductionRatio: 0,
  budgetName: 'medium',
  budgetMaxEstimatedTokens: 12_000,
  isWithinBudget: true,
})

export const createInitialRunnerMetrics = (): RunnerMetrics => ({
  durationMs: 0,
  filesChanged: 0,
  testsAdded: 0,
  decisionsReviewed: 0,
  revisionsRequested: 0,
  averageScore: 0,
  performance: { totalMs: 0 },
  tokenUsage: createEmptyTokenUsageMetrics(),
  security: {
    secretsRedacted: 0,
    blockedFilesSkipped: 0,
    unsafeActionsBlocked: 0,
  },
})

export const createInitialRunnerUiModel = (input: {
  taskId: string
  title: string
}): RunnerUiModel => ({
  taskId: input.taskId,
  title: input.title,
  status: 'idle',
  steps: [],
  metrics: createInitialRunnerMetrics(),
  events: [],
})

const upsertStep = (
  steps: readonly RunnerUiStep[],
  step: RunnerUiStep,
): readonly RunnerUiStep[] => {
  const idx = steps.findIndex((s) => s.id === step.id)
  if (idx === -1) return [...steps, step]

  const copy = [...steps]
  copy[idx] = step
  return copy
}

const getOrCreateStep = (
  steps: readonly RunnerUiStep[],
  stepId: string,
): RunnerUiStep => steps.find((s) => s.id === stepId) ?? {
  id: stepId,
  title: stepId,
  status: 'pending',
  activeAgent: 'none',
}

const asEvaluationResult = (payload: unknown): EvaluationResult | undefined => {
  if (!payload || typeof payload !== 'object') return undefined
  const p = payload as Partial<EvaluationResult>
  if (typeof p.taskId !== 'string') return undefined
  if (p.status !== 'pass' && p.status !== 'revise' && p.status !== 'fail') return undefined
  if (!p.scores || typeof p.scores !== 'object') return undefined
  if (typeof p.average !== 'number') return undefined
  return payload as EvaluationResult
}

const updateDuration = (model: RunnerUiModel, event: RunnerEvent): RunnerMetrics => {
  const startedAtMs = model.startedAtMs
  if (!startedAtMs) return model.metrics

  const durationMs = Math.max(0, event.timestampMs - startedAtMs)
  return {
    ...model.metrics,
    durationMs,
    performance: {
      ...model.metrics.performance,
      totalMs: durationMs,
    },
  }
}

export const reduceRunnerUiModel = (model: RunnerUiModel, event: RunnerEvent): RunnerUiModel => {
  const events = [...model.events, event]

  switch (event.type) {
    case 'task.started': {
      const startedAtMs = event.timestampMs
      return {
        ...model,
        status: 'running',
        startedAtMs,
        events,
      }
    }

    case 'step.started': {
      if (!event.stepId) return { ...model, events }

      const step = getOrCreateStep(model.steps, event.stepId)
      const nextStep: RunnerUiStep = {
        ...step,
        status: 'active',
        activeAgent: 'none',
        startedAtMs: step.startedAtMs ?? event.timestampMs,
      }

      return {
        ...model,
        activeStepId: event.stepId,
        steps: upsertStep(model.steps, nextStep),
        metrics: updateDuration(model, event),
        events,
      }
    }

    case 'builder.decision.created': {
      if (!event.stepId) return { ...model, events }

      const step = getOrCreateStep(model.steps, event.stepId)
      const nextStep: RunnerUiStep = {
        ...step,
        status: 'active',
        activeAgent: 'builder',
        latestDecision: event.message,
      }

      return {
        ...model,
        steps: upsertStep(model.steps, nextStep),
        metrics: updateDuration(model, event),
        events,
      }
    }

    case 'evaluator.review.created': {
      if (!event.stepId) return { ...model, events }

      const evalResult = asEvaluationResult(event.payload)
      const step = getOrCreateStep(model.steps, event.stepId)

      const latestReviewStatus = evalResult?.status
      const scores = evalResult?.scores

      const status: RunnerUiStepStatus =
        latestReviewStatus === 'pass'
          ? 'passed'
          : latestReviewStatus === 'fail'
            ? 'failed'
            : latestReviewStatus === 'revise'
              ? 'revising'
              : step.status

      const metricsBase = {
        ...updateDuration(model, event),
        decisionsReviewed: model.metrics.decisionsReviewed + 1,
        revisionsRequested:
          model.metrics.revisionsRequested + (latestReviewStatus === 'revise' ? 1 : 0),
        averageScore:
          typeof evalResult?.average === 'number' ? evalResult.average : model.metrics.averageScore,
      }

      const lowest = scores
        ? Object.entries(scores).reduce(
            (min, [dim, val]) => (val < min.val ? { dim: dim as ScoreDimension, val } : min),
            { dim: undefined as ScoreDimension | undefined, val: 999 },
          ).dim
        : undefined

      const metrics = {
        ...metricsBase,
        ...(lowest ? { lowestScoreDimension: lowest } : {}),
      }

      const nextStepBase: RunnerUiStep = {
        ...step,
        status,
        activeAgent: 'evaluator',
      }

      const nextStep: RunnerUiStep = {
        ...nextStepBase,
        ...(latestReviewStatus ? { latestReviewStatus } : {}),
        ...(scores ? { scores } : {}),
      }

      return {
        ...model,
        steps: upsertStep(model.steps, nextStep),
        metrics,
        events,
      }
    }

    case 'metrics.updated': {
      // In UI, we can publish precomputed metrics as payload and accept them.
      // Keep this optional and tolerant.
      const payload = event.payload
      if (!payload || typeof payload !== 'object') {
        return { ...model, metrics: updateDuration(model, event), events }
      }
      return { ...model, metrics: payload as RunnerMetrics, events }
    }

    case 'step.completed': {
      if (!event.stepId) return { ...model, events }

      const step = getOrCreateStep(model.steps, event.stepId)
      const completedAtMs = event.timestampMs

      const durationMs =
        step.startedAtMs === undefined
          ? step.durationMs
          : Math.max(0, completedAtMs - step.startedAtMs)

      const nextStep: RunnerUiStep = {
        ...step,
        activeAgent: 'none',
        completedAtMs,
        status: step.status === 'active' ? 'passed' : step.status,
        ...(durationMs === undefined ? {} : { durationMs }),
      }

      return {
        ...model,
        steps: upsertStep(model.steps, nextStep),
        metrics: updateDuration(model, event),
        events,
      }
    }

    case 'task.completed': {
      const { activeStepId: _activeStepId, ...rest } = model
      return {
        ...rest,
        status: 'passed',
        metrics: updateDuration(model, event),
        events,
      }
    }

    case 'task.failed': {
      const { activeStepId: _activeStepId, ...rest } = model
      return {
        ...rest,
        status: 'failed',
        metrics: updateDuration(model, event),
        events,
      }
    }

    default:
      return { ...model, metrics: updateDuration(model, event), events }
  }
}
