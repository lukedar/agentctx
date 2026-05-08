import { describe, expect, it } from 'vitest'
import { renderEvaluationResultMarkdown, renderReviewScoreMarkdown } from '../src/report'
import type { EvaluationResult } from '../src/types'

describe('report rendering', () => {
  it('renders scores in stable dimension order', () => {
    const scores = {
      correctness: 5,
      testability: 5,
      performance: 5,
      tokenUsage: 4,
      usability: 4,
      readability: 4,
      security: 5,
      simplicity: 4,
      maintainability: 4,
    } as const

    const md = renderReviewScoreMarkdown(scores)
    const lines = md.split('\n')
    expect(lines[0]).toContain('correctness')
    expect(lines[1]).toContain('testability')
    expect(lines[2]).toContain('performance')
    expect(lines[3]).toContain('tokenUsage')
    expect(lines[6]).toContain('security')
  })

  it('renders an evaluation block', () => {
    const result: EvaluationResult = {
      taskId: 't1',
      status: 'pass',
      scores: {
        correctness: 4,
        testability: 4,
        performance: 4,
        tokenUsage: 4,
        usability: 4,
        readability: 4,
        security: 4,
        simplicity: 4,
        maintainability: 4,
      },
      average: 4,
      blockingIssues: [],
      requiredChanges: [],
      approvedNextStep: 'Proceed',
    }

    const md = renderEvaluationResultMarkdown(result)
    expect(md).toContain('Status: PASS')
    expect(md).toContain('Approved next step')
  })
})
