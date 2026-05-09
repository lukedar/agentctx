import { describe, expect, it } from 'vitest'

import type { AgentCtxError } from '@agentctx/core'

import { formatBuildJson, formatCheckJson, formatErrorJson, formatSyncJson } from '../src/lib/jsonOutput'

describe('json output formatters', () => {
  it('formats build results into a stable machine-readable shape', () => {
    const json = formatBuildJson({
      config: {
        rootDir: '/repo',
        scope: { kind: 'workspace' },
        contextPoints: [],
        targets: ['agents-md'],
        include: [],
        exclude: [],
        contextBlocks: {
          architecture: true,
          conventions: true,
          runtime: true,
          api: true,
          database: true,
          frontend: true,
          testing: true,
          workflows: true,
          glossary: true,
        },
        budgets: { default: 'large', small: 4000, medium: 12000, large: 32000 },
        drift: { failOnCheck: true, thresholdPercent: 10 },
        security: { redactSecrets: true, includeEnvValues: false, allowSourceSnippets: false },
      },
      filesWritten: 5,
      durationMs: 42,
      tokenEstimate: { compiled: 123 },
      workspace: {
        scopeKey: 'workspace',
        facts: [],
        filesWritten: 2,
        compiledTokens: 100,
      },
      points: [
        {
          scopeKey: 'points/core',
          facts: [],
          filesWritten: 3,
          compiledTokens: 23,
        },
      ],
    })

    expect(json).toEqual({
      ok: true,
      filesWritten: 5,
      tokenEstimate: { compiled: 123 },
      durationMs: 42,
      workspace: {
        filesWritten: 2,
        compiledTokens: 100,
      },
      points: [
        {
          scopeKey: 'points/core',
          filesWritten: 3,
          compiledTokens: 23,
        },
      ],
    })
  })

  it('formats sync and check results consistently', () => {
    const sync = formatSyncJson({
      filesChanged: 1,
      filesChecked: 4,
      ok: true,
      messages: ['Updated: AGENTS.md'],
    })

    const check = formatCheckJson({
      ok: true,
      thresholdPercent: 10,
      checks: [
        {
          scopeKey: 'workspace',
          drift: { changedFacts: 0, totalFacts: 1, percent: 0, messages: [] },
          sync: {
            filesChanged: 0,
            filesChecked: 3,
            ok: true,
            messages: [],
          },
          shouldFail: false,
        },
      ],
    })

    expect(sync).toEqual({
      filesChanged: 1,
      filesChecked: 4,
      ok: true,
      messages: ['Updated: AGENTS.md'],
    })

    expect(check).toEqual({
      ok: true,
      thresholdPercent: 10,
      checks: [
        {
          scopeKey: 'workspace',
          drift: { changedFacts: 0, totalFacts: 1, percent: 0, messages: [] },
          sync: {
            filesChanged: 0,
            filesChecked: 3,
            ok: true,
            messages: [],
          },
          shouldFail: false,
        },
      ],
    })
  })

  it('formats typed errors for json output', () => {
    const error: AgentCtxError = {
      code: 'config_invalid',
      message: 'Invalid config',
    }

    expect(formatErrorJson(error)).toEqual({
      ok: false,
      error,
    })
  })
})
