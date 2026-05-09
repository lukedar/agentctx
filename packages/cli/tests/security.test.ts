import { describe, expect, it } from 'vitest'

import { hasPotentialSecrets, redactSecrets } from '../src/lib/security/redact'

describe('redactSecrets', () => {
  it('redacts every matching secret occurrence', () => {
    const token = 'sk-abcdefghijklmnopqrstuvwxyz123456'
    const text = `${token}\n${token}`

    expect(redactSecrets(text)).toBe('[REDACTED_SECRET]\n[REDACTED_SECRET]')
  })
})

describe('hasPotentialSecrets', () => {
  it('does not miss repeated matches across calls', () => {
    const token = 'ghp_abcdefghijklmnopqrstuvwxyz1234'

    expect(hasPotentialSecrets(token)).toBe(true)
    expect(hasPotentialSecrets(token)).toBe(true)
  })
})
