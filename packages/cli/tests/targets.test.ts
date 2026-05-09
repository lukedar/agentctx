import { describe, expect, it } from 'vitest'

import { parseTargetNames } from '../src/lib/targets'

describe('parseTargetNames', () => {
  it('deduplicates valid target names', () => {
    expect(parseTargetNames('claude,llms,claude')).toEqual(['claude', 'llms'])
  })

  it('throws on unknown target names instead of silently falling back', () => {
    expect(() => parseTargetNames('claude,unknown')).toThrow('Unknown target name(s): unknown')
  })
})
