import type {
  DecisionRecord,
  EvaluationResult,
  ReviewScore,
  RunnerTask,
  ScoreDimension,
} from './types'

const DIMENSION_ORDER: readonly ScoreDimension[] = [
  'correctness',
  'testability',
  'performance',
  'tokenUsage',
  'usability',
  'readability',
  'security',
  'simplicity',
  'maintainability',
] as const

const toBullets = (items: readonly string[]): string =>
  items.length === 0 ? '- (none)' : items.map((i) => `- ${i}`).join('\n')

export const renderReviewScoreMarkdown = (scores: ReviewScore): string => {
  return DIMENSION_ORDER.map((d) => `- ${d}: ${scores[d]}/5`).join('\n')
}

export const renderDecisionRecordMarkdown = (record: DecisionRecord): string => {
  return [
    `## Decision Record (${record.taskId})`,
    '',
    `Decision: ${record.decision}`,
    '',
    `Reason: ${record.reason}`,
    '',
    'Files affected:',
    toBullets(record.filesAffected),
    '',
    'Alternatives considered:',
    toBullets(record.alternativesConsidered),
    '',
    'Risks:',
    toBullets(record.risks),
    '',
    'Expected effects:',
    `- performance: ${record.expectedEffects.performance}`,
    `- tokenUsage: ${record.expectedEffects.tokenUsage}`,
    `- usability: ${record.expectedEffects.usability}`,
    `- readability: ${record.expectedEffects.readability}`,
    `- security: ${record.expectedEffects.security}`,
  ].join('\n')
}

export const renderEvaluationResultMarkdown = (result: EvaluationResult): string => {
  const status = result.status.toUpperCase()

  return [
    `## Evaluation (${result.taskId})`,
    '',
    `Status: ${status}`,
    '',
    'Scores:',
    renderReviewScoreMarkdown(result.scores),
    `Average: ${result.average.toFixed(2)}/5`,
    '',
    'Blocking issues:',
    toBullets(result.blockingIssues),
    '',
    'Required changes:',
    toBullets(result.requiredChanges),
    '',
    'Approved next step:',
    `- ${result.approvedNextStep || '(none)'}`,
  ].join('\n')
}

export const renderTaskOverviewMarkdown = (task: RunnerTask): string => {
  return [
    '# Dual-Agent Runner Report',
    '',
    '## Task',
    '',
    `- id: ${task.id}`,
    `- title: ${task.title}`,
    `- riskLevel: ${task.riskLevel}`,
    '',
    'Goal:',
    task.goal,
    '',
    'Constraints:',
    toBullets(task.constraints),
    '',
    'Success criteria:',
    toBullets(task.successCriteria),
    '',
    'Files likely affected:',
    toBullets(task.filesLikelyAffected),
  ].join('\n')
}

export const renderRunReportMarkdown = (input: {
  task: RunnerTask
  decisions: readonly DecisionRecord[]
  evaluations: readonly EvaluationResult[]
}): string => {
  const decisions = input.decisions.map(renderDecisionRecordMarkdown).join('\n\n')
  const evaluations = input.evaluations.map(renderEvaluationResultMarkdown).join('\n\n')

  return [
    renderTaskOverviewMarkdown(input.task),
    '',
    '---',
    '',
    '# Decisions',
    '',
    decisions || '_No decisions recorded._',
    '',
    '---',
    '',
    '# Evaluations',
    '',
    evaluations || '_No evaluations recorded._',
    '',
  ].join('\n')
}
