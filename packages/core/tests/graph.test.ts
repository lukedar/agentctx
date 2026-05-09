import { describe, expect, it } from 'vitest'

import { buildGraph } from '../src/graph'
import type { AgentCtxConfig, Fact } from '../src/types'

const config: AgentCtxConfig = {
  rootDir: '/repo',
  scope: { kind: 'workspace' },
  contextPoints: [],
  targets: ['agents-md'],
  include: [],
  exclude: [],
  contextBlocks: {
    architecture: true,
    conventions: true,
    api: true,
    database: true,
    frontend: true,
    testing: true,
    workflows: true,
    glossary: true,
  },
  budgets: {
    default: 'large',
    small: 4_000,
    medium: 12_000,
    large: 32_000,
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
}

describe('buildGraph', () => {
  it('builds app and package nodes plus internal dependency relationships', () => {
    const facts: readonly Fact[] = [
      {
        kind: 'package',
        source: 'apps/web/package.json',
        confidence: 1,
        data: { name: '@repo/web', path: 'apps/web' },
      },
      {
        kind: 'package',
        source: 'packages/shared/package.json',
        confidence: 1,
        data: { name: '@repo/shared', path: 'packages/shared' },
      },
      {
        kind: 'dependency',
        source: 'apps/web/package.json',
        confidence: 1,
        data: {
          packageName: '@repo/web',
          packagePath: 'apps/web',
          name: '@repo/shared',
          version: 'workspace:*',
          dependencyType: 'dependencies',
        },
      },
    ]

    const graph = buildGraph(facts, config)

    expect(graph.apps).toEqual([
      { id: '@repo/web', path: 'apps/web', name: '@repo/web', kind: 'app' },
    ])
    expect(graph.packages).toEqual([
      { id: '@repo/shared', path: 'packages/shared', name: '@repo/shared', kind: 'package' },
    ])
    expect(graph.relationships).toEqual([
      { from: '@repo/web', to: '@repo/shared', type: 'depends-on' },
    ])
  })

  it('limits point graphs to package facts under the configured point path', () => {
    const facts: readonly Fact[] = [
      {
        kind: 'package',
        source: 'package.json',
        confidence: 1,
        data: { name: 'agentctx-workspace', path: '.' },
      },
      {
        kind: 'package',
        source: 'docs-agentctx/package.json',
        confidence: 1,
        data: { name: 'agentctx-docs', path: 'docs-agentctx' },
      },
      {
        kind: 'package',
        source: 'docs-agentctx/.vitepress/cache/deps/package.json',
        confidence: 1,
        data: { name: 'deps', path: 'docs-agentctx/.vitepress/cache/deps' },
      },
    ]

    const graph = buildGraph(facts, {
      ...config,
      scope: { kind: 'point', name: 'docs-agentctx', path: 'docs-agentctx', type: 'docs' },
    })

    expect(graph.packages).toEqual([
      { id: 'agentctx-docs', path: 'docs-agentctx', name: 'agentctx-docs', kind: 'package' },
    ])
    expect(graph.packages.some((pkg) => pkg.path === '.')).toBe(false)
  })
})
