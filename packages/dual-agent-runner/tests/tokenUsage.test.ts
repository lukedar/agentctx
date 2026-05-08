import { describe, expect, it } from 'vitest'
import { createTokenUsageMetrics, DEFAULT_TOKEN_BUDGETS, findTokenBudget } from '../src/tokenUsage'

describe('token usage metrics', () => {
  it('computes reduction and budget status', () => {
    const budget = findTokenBudget(DEFAULT_TOKEN_BUDGETS, 'small')
    if (!budget) throw new Error('missing small budget')

    const metrics = createTokenUsageMetrics('a'.repeat(4000), 'a'.repeat(1000), budget)
    expect(metrics.inputEstimatedTokens).toBeGreaterThan(metrics.outputEstimatedTokens)
    expect(metrics.reducedEstimatedTokens).toBeGreaterThan(0)
    expect(metrics.budgetName).toBe('small')
  })
})
