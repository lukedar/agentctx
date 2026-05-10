import { describe, expect, it } from 'vitest'

import { parseContextFileCategories, parseContextFileNames } from '../src/lib/contextFiles'

describe('context file CLI helpers', () => {
  it('parses category and file filters', () => {
    expect(parseContextFileCategories('frontend,backend,frontend')).toEqual(['frontend', 'backend'])
    expect(parseContextFileNames('overview,routes,overview')).toEqual(['overview', 'routes'])
  })

  it('rejects unknown filters', () => {
    expect(() => parseContextFileCategories('mobile')).toThrow('Unknown context file category')
    expect(() => parseContextFileNames('unknown')).toThrow('Unknown context file')
  })
})
