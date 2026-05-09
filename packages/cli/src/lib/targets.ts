import type { TargetName } from '@agentctx/core'

const VALID_TARGETS: readonly TargetName[] = ['agents-md', 'claude', 'cursor', 'copilot', 'llms']

const targetSet = new Set<TargetName>(VALID_TARGETS)

export const isTargetName = (value: string): value is TargetName => targetSet.has(value as TargetName)

export const parseTargetNames = (value: unknown): readonly TargetName[] | undefined => {
  if (typeof value !== 'string') return undefined

  const requested = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (requested.length === 0) return undefined

  const invalid = requested.filter((entry) => !isTargetName(entry))
  if (invalid.length > 0) {
    throw new Error(`Unknown target name(s): ${invalid.join(', ')}`)
  }

  return [...new Set(requested)] as readonly TargetName[]
}
