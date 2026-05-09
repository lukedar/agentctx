import { describe, expect, it } from 'vitest'

import type { AgentCtxConfig } from '@agentctx/core'

import {
  createPointConfig,
  normalizePointName,
  parsePointFlagList,
  resolvePointScope,
  resolveSyncScopes,
  selectContextPoints,
} from '../src/lib/points'

const createWorkspaceConfig = (): AgentCtxConfig => ({
  rootDir: '/repo',
  scope: { kind: 'workspace' },
  workspace: { packageManager: 'pnpm' },
  contextPoints: [
    {
      name: 'UI Package',
      path: 'packages/ui',
      type: 'frontend',
      frameworks: ['react', 'vite'],
      dependsOn: ['core'],
    },
    {
      name: 'core',
      path: 'packages/core',
      type: 'package',
    },
  ],
  targets: ['agents-md'],
  include: ['package.json'],
  exclude: ['dist/**'],
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
  budgets: {
    default: 'large',
    small: 4000,
    medium: 12000,
    large: 32000,
  },
  drift: {
    failOnCheck: true,
    thresholdPercent: 10,
  },
  security: {
    redactSecrets: true,
    includeEnvValues: false,
    allowSourceSnippets: false,
  },
})

describe('point helpers', () => {
  it('parses and normalizes point names from CLI flags', () => {
    expect(parsePointFlagList({ point: ' ui ', points: 'core, docs ' })).toEqual(['ui', 'core', 'docs'])
    expect(normalizePointName('UI Package')).toBe('UI-Package')
  })

  it('selects configured points deterministically', () => {
    const selected = selectContextPoints(createWorkspaceConfig(), ['UI Package'])
    expect(selected.map((point) => point.name)).toEqual(['UI-Package'])
  })

  it('creates a point-scoped config with explicit scope metadata', () => {
    const workspace = createWorkspaceConfig()
    const point = selectContextPoints(workspace, ['UI Package'])[0]
    if (!point) throw new Error('Expected UI Package point')
    const config = createPointConfig(workspace, point)

    expect(config.scope).toEqual({
      kind: 'point',
      name: 'UI-Package',
      path: 'packages/ui',
      type: 'frontend',
      frameworks: ['react', 'vite'],
      dependsOn: ['core'],
    })
    expect(config.contextPoints).toEqual([])
    expect(config.include).toContain('packages/ui/**')
  })

  it('resolves sync scopes from configured point names', () => {
    const scope = resolvePointScope(createWorkspaceConfig(), 'UI Package')
    expect(scope).toEqual({ kind: 'point', name: 'UI-Package', pointPath: 'packages/ui' })
  })

  it('resolves sync scopes to workspace plus all configured points by default', () => {
    const scopes = resolveSyncScopes(createWorkspaceConfig(), [])
    expect(scopes).toEqual([
      { kind: 'workspace' },
      { kind: 'point', name: 'core', pointPath: 'packages/core' },
      { kind: 'point', name: 'UI-Package', pointPath: 'packages/ui' },
    ])
  })
})
