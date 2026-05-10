import {
  contextFileRegistry,
  getContextFileDefinition,
  type ContextFileCategory,
} from '@agentctx/core'

const validCategories: readonly ContextFileCategory[] = [
  'core',
  'root',
  'frontend',
  'backend',
  'worker',
  'package',
  'data',
  'infra',
]

const categorySet = new Set<ContextFileCategory>(validCategories)

export const parseContextFileCategories = (value: unknown): readonly ContextFileCategory[] | undefined => {
  if (typeof value !== 'string') return undefined
  const requested = value.split(',').map((item) => item.trim()).filter(Boolean)
  if (requested.length === 0) return undefined

  const invalid = requested.filter((item) => !categorySet.has(item as ContextFileCategory))
  if (invalid.length > 0) throw new Error(`Unknown context file categor${invalid.length === 1 ? 'y' : 'ies'}: ${invalid.join(', ')}`)

  return [...new Set(requested)] as readonly ContextFileCategory[]
}

export const parseContextFileNames = (value: unknown): readonly string[] | undefined => {
  if (typeof value !== 'string') return undefined
  const requested = value.split(',').map((item) => item.trim()).filter(Boolean)
  if (requested.length === 0) return undefined

  const invalid = requested.filter((item) => !getContextFileDefinition(item))
  if (invalid.length > 0) throw new Error(`Unknown context file${invalid.length === 1 ? '' : 's'}: ${invalid.join(', ')}`)

  return [...new Set(requested)]
}

export const listContextFileNames = (): readonly string[] =>
  contextFileRegistry.map((item) => item.name)
