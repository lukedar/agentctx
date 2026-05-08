import { describe, expect, it } from 'vitest'
import { evaluateScores } from '../src/scoring'
import type { ReviewScore } from '../src/types'

const baseScores = (): ReviewScore => ({
  correctness: 4,
  testability: 4,
  performance: 4,
  tokenUsage: 4,
  usability: 4,
  readability: 4,
  security: 4,
  simplicity: 4,
  maintainability: 4,
})

describe('evaluateScores', () => {
  it('passes when all dimensions are >=4 and average >=4', () => {
    expect(evaluateScores(baseScores())).toBe('pass')
  })

  it('fails when any dimension is below 3', () => {
    const scores: ReviewScore = { ...baseScores(), readability: 2 }
    expect(evaluateScores(scores)).toBe('fail')
  })

  it('revises when security is below 4 (but not below 3)', () => {
    const scores: ReviewScore = { ...baseScores(), security: 3 }
    expect(evaluateScores(scores)).toBe('revise')
  })

  it('revises when tokenUsage is below 4 (but not below 3)', () => {
    const scores: ReviewScore = { ...baseScores(), tokenUsage: 3 }
    expect(evaluateScores(scores)).toBe('revise')
  })

  it('revises when average is below 4 even if no dimension is below 3', () => {
    const scores: ReviewScore = { ...baseScores(), usability: 3 }
    expect(evaluateScores(scores)).toBe('revise')
  })
})
