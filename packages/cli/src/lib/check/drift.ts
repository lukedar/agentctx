import type { Fact } from '@agentctx/core'

export type DriftReport = Readonly<{
  changedFacts: number
  totalFacts: number
  percent: number
  messages: readonly string[]
}>

const key = (f: Fact): string => `${f.kind}|${f.source}|${JSON.stringify(f.data)}`

export const calculateDrift = (previous: readonly Fact[], current: readonly Fact[]): DriftReport => {
  const prev = new Set(previous.map(key))
  const cur = new Set(current.map(key))

  let changed = 0
  for (const k of cur) if (!prev.has(k)) changed++

  const total = Math.max(current.length, 1)
  const percent = Math.round((changed / total) * 100)

  const messages: string[] = []
  if (changed > 0) messages.push(`${changed} facts changed`)

  return {
    changedFacts: changed,
    totalFacts: total,
    percent,
    messages,
  }
}
