import type { Fact } from './types'

const uniq = (items: readonly string[]): readonly string[] => {
  const out: string[] = []
  const seen = new Set<string>()

  for (const item of items) {
    if (seen.has(item)) continue
    seen.add(item)
    out.push(item)
  }

  return out
}

const sortedUnique = (items: readonly string[]): readonly string[] =>
  [...uniq(items)].sort((left, right) => left.localeCompare(right))

export type CtxFactIndex = Readonly<{
  byKind: (kind: Fact['kind']) => readonly Fact[]
  strings: (kind: Fact['kind'], key: string) => readonly string[]
  paths: (kind: Fact['kind'], key: string, filter?: (fact: Fact) => boolean) => readonly string[]
}>

export const createCtxFactIndex = (facts: readonly Fact[]): CtxFactIndex => {
  const byKindMap = new Map<Fact['kind'], Fact[]>()

  for (const fact of facts) {
    const existing = byKindMap.get(fact.kind)
    if (existing) existing.push(fact)
    else byKindMap.set(fact.kind, [fact])
  }

  const byKind = (kind: Fact['kind']): readonly Fact[] => byKindMap.get(kind) ?? []

  const strings = (kind: Fact['kind'], key: string): readonly string[] => {
    const values: string[] = []

    for (const fact of byKind(kind)) {
      const value = fact.data[key]
      if (typeof value === 'string' && value.trim()) values.push(value.trim())
    }

    return sortedUnique(values)
  }

  const paths = (
    kind: Fact['kind'],
    key: string,
    filter?: (fact: Fact) => boolean,
  ): readonly string[] => {
    const values: string[] = []

    for (const fact of byKind(kind)) {
      if (filter && !filter(fact)) continue
      const value = fact.data[key]
      if (typeof value === 'string' && value.trim()) values.push(value.trim())
    }

    return sortedUnique(values)
  }

  return { byKind, strings, paths }
}
