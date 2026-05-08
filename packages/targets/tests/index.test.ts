import { describe, expect, it } from 'vitest'

import { mvpTargets } from '../src/index'

describe('mvpTargets', () => {
  it('only exposes implemented MVP targets', () => {
    expect(Object.keys(mvpTargets).sort()).toEqual([
      'agents-md',
      'claude',
      'copilot',
      'cursor',
      'llms',
    ])
  })
})
