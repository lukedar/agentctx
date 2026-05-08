export type TokenBudgetName = 'small' | 'medium' | 'large' | 'full'

export type TokenBudget = Readonly<{
  name: TokenBudgetName
  maxEstimatedTokens: number
  description: string
}>

export const DEFAULT_TOKEN_BUDGETS: readonly TokenBudget[] = [
  { name: 'small', maxEstimatedTokens: 4_000, description: 'Tight task context' },
  { name: 'medium', maxEstimatedTokens: 12_000, description: 'Default coding agent context' },
  { name: 'large', maxEstimatedTokens: 32_000, description: 'Large repo reasoning context' },
  { name: 'full', maxEstimatedTokens: 100_000, description: 'Docs/export only, not default agent prompt' },
] as const

export const estimateTokens = (text: string): number => Math.ceil(text.length / 4)

export type TokenUsageMetrics = Readonly<{
  inputEstimatedTokens: number
  outputEstimatedTokens: number
  reducedEstimatedTokens: number
  reductionRatio: number
  budgetName: TokenBudgetName
  budgetMaxEstimatedTokens: number
  isWithinBudget: boolean
}>

export const createTokenUsageMetrics = (
  inputText: string,
  outputText: string,
  budget: TokenBudget,
): TokenUsageMetrics => {
  const inputEstimatedTokens = estimateTokens(inputText)
  const outputEstimatedTokens = estimateTokens(outputText)
  const reducedEstimatedTokens = Math.max(0, inputEstimatedTokens - outputEstimatedTokens)

  return {
    inputEstimatedTokens,
    outputEstimatedTokens,
    reducedEstimatedTokens,
    reductionRatio: inputEstimatedTokens === 0 ? 0 : reducedEstimatedTokens / inputEstimatedTokens,
    budgetName: budget.name,
    budgetMaxEstimatedTokens: budget.maxEstimatedTokens,
    isWithinBudget: outputEstimatedTokens <= budget.maxEstimatedTokens,
  }
}

export const findTokenBudget = (
  budgets: readonly TokenBudget[],
  name: TokenBudgetName,
): TokenBudget | undefined => budgets.find((b) => b.name === name)
