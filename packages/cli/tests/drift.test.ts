import { describe, expect, it } from 'vitest'

import { calculateDrift } from '../src/lib/check/drift'

describe('calculateDrift', () => {
  it('returns 0% when facts are identical', () => {
    const facts = [
      { kind: 'framework', source: 'package.json', confidence: 1, data: { name: 'react' } },
    ] as const

    const report = calculateDrift(facts, facts)
    expect(report.percent).toBe(0)
  })

  it('reports drift when new facts appear', () => {
    const prev = [] as const
    const cur = [
      { kind: 'framework', source: 'package.json', confidence: 1, data: { name: 'react' } },
      { kind: 'language', source: 'tsconfig.json', confidence: 1, data: { name: 'typescript' } },
    ] as const

    const report = calculateDrift(prev, cur)
    expect(report.percent).toBeGreaterThan(0)
  })
})
