import { describe, expect, it } from 'vitest'

import { mergeGeneratedContent } from '../src/lib/sync/generatedBlock'

const gen = (content: string) =>
  ['<!-- agentctx:start -->', content, '<!-- agentctx:end -->', ''].join('\n')

describe('mergeGeneratedContent', () => {
  it('is idempotent when destination already contains a generated block', () => {
    const existing = [
      '---',
      'description: test',
      '---',
      '',
      gen('- rule1'),
      '',
      'manual footer',
      '',
    ].join('\n')

    const generated = [
      '---',
      'description: test',
      '---',
      '',
      gen('- rule1'),
    ].join('\n')

    const merged1 = mergeGeneratedContent(existing, generated)
    const merged2 = mergeGeneratedContent(merged1, generated)

    expect(merged2).toBe(merged1)
    expect(merged2).toContain('manual footer')
  })

  it('appends generated content when no block exists', () => {
    const existing = 'hello\n'
    const generated = gen('x')
    const merged = mergeGeneratedContent(existing, generated)
    expect(merged).toContain('hello')
    expect(merged).toContain('agentctx:start')
  })
})
