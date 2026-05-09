import { describe, expect, it } from 'vitest'

import { planContextBlocks } from '../src/contextBlocks'
import type { AgentCtxConfig, ContextGraph } from '../src/types'

const createConfig = (budget: AgentCtxConfig['budgets']['default'] = 'large'): AgentCtxConfig => ({
  rootDir: '/repo',
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
    default: budget,
    small: 20,
    medium: 200,
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
  workspace: {
    packageManager: 'pnpm',
  },
})

describe('planContextBlocks', () => {
  it('renders deterministic context-block content from facts', () => {
    const graph: ContextGraph = {
      rootDir: '/repo',
      facts: [
        { kind: 'package-manager', source: 'pnpm-lock.yaml', confidence: 1, data: { name: 'pnpm' } },
        { kind: 'framework', source: 'package.json', confidence: 1, data: { name: 'react' } },
        { kind: 'framework', source: 'package.json', confidence: 1, data: { name: 'express' } },
        { kind: 'language', source: 'tsconfig.json', confidence: 1, data: { name: 'typescript' } },
        { kind: 'test-runner', source: 'package.json', confidence: 1, data: { name: 'vitest' } },
        { kind: 'script', source: 'package.json', confidence: 1, data: { name: 'test' } },
        { kind: 'env-var', source: '.env.example', confidence: 1, data: { name: 'API_KEY' } },
        { kind: 'route', source: 'app/api/health/route.ts', confidence: 1, data: { kind: 'next-app-api', path: '/health', file: 'app/api/health/route.ts' } },
      ],
      apps: [
        { id: '@repo/web', path: 'apps/web', name: '@repo/web', kind: 'app' },
      ],
      packages: [
        { id: '@repo/shared', path: 'packages/shared', name: '@repo/shared', kind: 'package' },
      ],
      relationships: [
        { from: '@repo/web', to: '@repo/shared', type: 'depends-on' },
      ],
      contextBlocks: {},
    }

    const contextBlocks = planContextBlocks(graph, createConfig())

    expect(contextBlocks.map((contextBlock) => contextBlock.name)).toEqual([
      'api',
      'architecture',
      'conventions',
      'database',
      'frontend',
      'glossary',
      'testing',
      'workflows',
    ])
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'architecture')?.content).toContain('Context scope: workspace')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'architecture')?.content).toContain('Package manager: pnpm')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'architecture')?.content).toContain('Apps in scope: @repo/web (apps/web)')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'architecture')?.content).toContain('Internal dependencies: @repo/web -> @repo/shared')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'api')?.content).toContain('API-related frameworks detected: express')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'api')?.content).toContain('Route paths detected: /health')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'glossary')?.content).toContain('API_KEY')
  })

  it('uses point scope metadata to make point context blocks more specific', () => {
    const graph: ContextGraph = {
      rootDir: '/repo',
      facts: [
        { kind: 'package-manager', source: 'pnpm-lock.yaml', confidence: 1, data: { name: 'pnpm' } },
        { kind: 'package', source: 'packages/ui/package.json', confidence: 1, data: { name: '@repo/ui', path: 'packages/ui' } },
        { kind: 'language', source: 'packages/ui/tsconfig.json', confidence: 1, data: { name: 'typescript' } },
      ],
      apps: [],
      packages: [{ id: '@repo/ui', path: 'packages/ui', name: '@repo/ui', kind: 'package' }],
      relationships: [],
      contextBlocks: {},
    }

    const contextBlocks = planContextBlocks(graph, {
      ...createConfig(),
      scope: {
        kind: 'point',
        name: 'ui',
        path: 'packages/ui',
        type: 'frontend',
        frameworks: ['react', 'vite'],
        dependsOn: ['core'],
      },
    })

    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'architecture')?.content).toContain('Context scope: point `ui` at `packages/ui`')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'architecture')?.content).toContain('Point type: frontend')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'architecture')?.content).toContain('Point depends on: core')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'frontend')?.content).toContain('Configured point frameworks: react, vite')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'architecture')?.content).toContain('`packages/ui/package.json`: Package/app manifest in scope')
    expect(contextBlocks.find((contextBlock) => contextBlock.name === 'architecture')?.content).not.toContain('`package.json`: Package/app manifest in scope')
  })

  it('fits context-block output to the configured budget', () => {
    const graph: ContextGraph = {
      rootDir: '/repo',
      facts: [
        { kind: 'package-manager', source: 'pnpm-lock.yaml', confidence: 1, data: { name: 'pnpm' } },
        { kind: 'script', source: 'package.json', confidence: 1, data: { name: 'build' } },
        { kind: 'script', source: 'package.json', confidence: 1, data: { name: 'test' } },
        { kind: 'script', source: 'package.json', confidence: 1, data: { name: 'typecheck' } },
      ],
      apps: [],
      packages: [],
      relationships: [],
      contextBlocks: {},
    }

    const contextBlocks = planContextBlocks(graph, createConfig('small'))
    const totalTokens = contextBlocks.reduce((sum, contextBlock) => sum + contextBlock.tokenEstimate, 0)

    expect(totalTokens).toBeLessThanOrEqual(20)
  })
})
