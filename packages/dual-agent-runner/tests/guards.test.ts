import { describe, expect, it } from 'vitest'
import {
  matchesAnyGlob,
  matchesGlob,
  redactSensitiveValue,
  DEFAULT_SECRET_PATTERNS,
} from '../src/guards'

describe('redactSensitiveValue', () => {
  it('redacts values that look like tokens', () => {
    expect(redactSensitiveValue('sk-abcdefghijklmnopqrstuvwxyz1234')).toBe('[REDACTED]')
    expect(redactSensitiveValue('ghp_abcdefghijklmnopqrstuvwxyz123456')).toBe('[REDACTED]')
  })

  it('does not redact normal strings', () => {
    expect(redactSensitiveValue('hello world')).toBe('hello world')
  })
})

describe('glob matching', () => {
  it('matches basic star patterns', () => {
    expect(matchesGlob('secrets.txt', 'secrets.*')).toBe(true)
    expect(matchesGlob('cert.pem', '*.pem')).toBe(true)
    expect(matchesGlob('cert.pfx', '*.pfx')).toBe(true)
  })

  it('matches dot-env patterns', () => {
    expect(matchesGlob('.env', '.env')).toBe(true)
    expect(matchesGlob('.env.production', '.env.*')).toBe(true)
  })

  it('matches any secret patterns', () => {
    expect(matchesAnyGlob('.env.local', DEFAULT_SECRET_PATTERNS)).toBe(true)
    expect(matchesAnyGlob('src/index.ts', DEFAULT_SECRET_PATTERNS)).toBe(false)
  })
})
