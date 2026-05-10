import { describe, expect, it } from 'vitest'

import {
  contextFileRegistry,
  detectContextFileCapabilities,
  renderContextFiles,
  selectContextFiles,
} from '../src/contextFiles'
import type { AgentCtxConfig, CtxGraph } from '../src/types'

const createConfig = (partial: Partial<AgentCtxConfig> = {}): AgentCtxConfig => ({
  rootDir: '/repo',
  ctxPoints: [],
  targets: ['agents-md'],
  include: [],
  exclude: [],
  ctxBlocks: {
    architecture: true,
    conventions: true,
    runtime: true,
    api: true,
    database: true,
    operations: true,
    data: true,
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
  ...partial,
})

const createGraph = (partial: Partial<CtxGraph> = {}): CtxGraph => ({
  rootDir: '/repo',
  facts: [],
  apps: [],
  packages: [],
  relationships: [],
  ctxBlocks: {},
  ...partial,
})

describe('context files', () => {
  it('defines deterministic universal files with token budgets and safety metadata', () => {
    const universal = contextFileRegistry.filter((item) => item.category === 'core')

    expect(universal.map((item) => item.name)).toEqual([
      'overview',
      'architecture',
      'conventions',
      'commands',
      'dependencies',
      'testing',
      'security',
      'boundaries',
    ])
    expect(universal.every((item) => item.maxTokens > 0)).toBe(true)
    expect(contextFileRegistry.find((item) => item.name === 'security')?.publicSafe).toBe(false)
  })

  it('detects capabilities from graph facts and point metadata', () => {
    const graph = createGraph({
      facts: [
        { kind: 'framework', source: 'package.json', confidence: 1, data: { name: 'react' } },
        { kind: 'route', source: 'src/routes.tsx', confidence: 1, data: { file: 'src/routes.tsx' } },
        { kind: 'api', source: 'src/client.ts', confidence: 1, data: { path: 'src/client.ts' } },
        { kind: 'database', source: 'prisma/schema.prisma', confidence: 1, data: { path: 'prisma/schema.prisma' } },
        { kind: 'operations', source: '.github/workflows/ci.yml', confidence: 1, data: { path: '.github/workflows/ci.yml' } },
      ],
    })

    expect(detectContextFileCapabilities(graph, createConfig())).toEqual(expect.arrayContaining([
      'frontend',
      'routing',
      'api',
      'database',
      'infrastructure',
      'ci',
    ]))
  })

  it('selects universal and relevant capability files without speculative files', () => {
    const graph = createGraph({
      facts: [
        { kind: 'framework', source: 'package.json', confidence: 1, data: { name: 'react' } },
        { kind: 'route', source: 'src/routes.tsx', confidence: 1, data: { file: 'src/routes.tsx' } },
      ],
    })

    const selected = selectContextFiles({ graph, config: createConfig({ scope: { kind: 'point', name: 'web', path: 'apps/web', type: 'frontend' } }) })
    const names = selected.map((item) => item.name)

    expect(names).toEqual(expect.arrayContaining(['overview', 'security', 'boundaries', 'routes']))
    expect(names).not.toContain('database')
    expect(names).not.toContain('workspace')
  })

  it('enforces safety files unless unsafe config is enabled', () => {
    const graph = createGraph()

    const safeNames = selectContextFiles({
      graph,
      config: createConfig({ contextFiles: { exclude: ['security', 'boundaries'] } }),
    }).map((item) => item.name)

    const unsafeNames = selectContextFiles({
      graph,
      config: createConfig({
        allowUnsafeContextConfig: true,
        contextFiles: { exclude: ['security', 'boundaries'] },
      }),
    }).map((item) => item.name)

    expect(safeNames).toEqual(expect.arrayContaining(['security', 'boundaries']))
    expect(unsafeNames).not.toContain('security')
    expect(unsafeNames).not.toContain('boundaries')
  })

  it('renders selected files with public-safe metadata', () => {
    const files = renderContextFiles(createGraph(), createConfig())

    expect(files.find((file) => file.name === 'overview')?.content).toContain('# Overview')
    expect(files.find((file) => file.name === 'security')?.publicSafe).toBe(false)
    expect(files.every((file) => file.tokenEstimate > 0)).toBe(true)
  })
})
