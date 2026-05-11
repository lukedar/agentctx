import { describe, expect, it } from 'vitest'

import { planCtxBlocks } from '../src/ctxBlocks'
import type { AgentCtxConfig, CtxGraph } from '../src/types'

const createConfig = (budget: AgentCtxConfig['budgets']['default'] = 'large'): AgentCtxConfig => ({
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

describe('planCtxBlocks', () => {
  it('renders deterministic context-block content from facts', () => {
    const graph: CtxGraph = {
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
      ctxBlocks: {},
    }

    const ctxBlocks = planCtxBlocks(graph, createConfig())

    expect(ctxBlocks.map((ctxBlock) => ctxBlock.name)).toEqual([
      'api',
      'architecture',
      'conventions',
      'frontend',
      'glossary',
      'testing',
      'workflows',
    ])
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('Context scope: workspace')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('## Responsibilities')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('## Critical Invariants')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('## Unsafe Changes')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('Package manager: pnpm')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('Apps in scope: @repo/web (apps/web)')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('Internal dependencies: @repo/web -> @repo/shared')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'api')?.content).toContain('API-related frameworks detected: express')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'api')?.content).toContain('API implementation shape: Middleware-style request pipeline detected.')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'api')?.content).toContain('Route paths detected: /health')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('Frontend implementation shape: Component-driven React UI detected.')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'glossary')?.content).toContain('API_KEY')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'workflows')?.content).toContain('pnpm run test')
  })

  it('uses point scope metadata to make point CtxBlocks more specific', () => {
    const graph: CtxGraph = {
      rootDir: '/repo',
      facts: [
        { kind: 'package-manager', source: 'pnpm-lock.yaml', confidence: 1, data: { name: 'pnpm' } },
        { kind: 'package', source: 'packages/ui/package.json', confidence: 1, data: { name: '@repo/ui', path: 'packages/ui' } },
        { kind: 'language', source: 'packages/ui/tsconfig.json', confidence: 1, data: { name: 'typescript' } },
      ],
      apps: [],
      packages: [{ id: '@repo/ui', path: 'packages/ui', name: '@repo/ui', kind: 'package' }],
      relationships: [],
      ctxBlocks: {},
    }

    const ctxBlocks = planCtxBlocks(graph, {
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

    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('Context scope: point `ui` at `packages/ui`')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('Point type: frontend')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('Point depends on: core')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('Configured point frameworks: react, vite')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('Frontend implementation shape: Component-driven React UI detected. Bundler-led frontend entrypoint detected.')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).toContain('`packages/ui/package.json`: Package/app manifest in scope')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'architecture')?.content).not.toContain('`package.json`: Package/app manifest in scope')
  })

  it('generates runtime context for non-frontend stacks without inventing frontend output', () => {
    const graph: CtxGraph = {
      rootDir: '/repo',
      facts: [
        { kind: 'runtime', source: 'pyproject.toml', confidence: 1, data: { name: 'python' } },
        { kind: 'framework', source: 'pyproject.toml', confidence: 1, data: { name: 'fastapi' } },
        { kind: 'route', source: 'app/main.py', confidence: 0.8, data: { kind: 'api-module', path: '/health', file: 'app/main.py' } },
      ],
      apps: [],
      packages: [],
      relationships: [],
      ctxBlocks: {},
    }

    const ctxBlocks = planCtxBlocks(graph, createConfig())

    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'runtime')?.content).toContain('Runtimes detected: python')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'api')?.content).toContain('API-related frameworks detected: fastapi')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'api')?.content).toContain('API implementation shape: Python application or router entrypoint detected.')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')).toBeUndefined()
  })

  it('generates operations context for infra-oriented scopes without frontend output', () => {
    const graph: CtxGraph = {
      rootDir: '/repo',
      facts: [
        { kind: 'operations', source: 'infra/main.tf', confidence: 1, data: { name: 'terraform', path: 'infra/main.tf' } },
        { kind: 'operations', source: '.github/workflows/deploy.yml', confidence: 1, data: { name: 'github-actions', path: '.github/workflows/deploy.yml' } },
      ],
      apps: [],
      packages: [],
      relationships: [],
      ctxBlocks: {},
    }

    const ctxBlocks = planCtxBlocks(graph, createConfig())

    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'operations')?.content).toContain('Operational surfaces detected: github-actions, terraform')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'operations')?.content).toContain('Operations implementation shape:')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')).toBeUndefined()
  })

  it('generates data context for data-oriented python scopes without forcing api output', () => {
    const graph: CtxGraph = {
      rootDir: '/repo',
      facts: [
        { kind: 'runtime', source: 'research/main.py', confidence: 1, data: { name: 'python' } },
        { kind: 'data', source: 'sources/schema.yml', confidence: 1, data: { name: 'source', path: 'sources/schema.yml' } },
        { kind: 'data', source: 'jobs/daily_refresh.ts', confidence: 1, data: { name: 'job', path: 'jobs/daily_refresh.ts' } },
        { kind: 'data', source: 'quality/great_expectations.yml', confidence: 1, data: { name: 'quality', path: 'quality/great_expectations.yml' } },
        { kind: 'data', source: 'research/alpha.ipynb', confidence: 1, data: { name: 'notebook', path: 'research/alpha.ipynb' } },
      ],
      apps: [],
      packages: [],
      relationships: [],
      ctxBlocks: {},
    }

    const ctxBlocks = planCtxBlocks(graph, createConfig())

    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'data')?.content).toContain('Data-oriented Python runtime detected.')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'data')?.content).toContain('Data surfaces detected: job, notebook, quality, source')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'data')?.content).toContain('Data implementation shape: Data source contracts detected. Scheduled or batch job definitions detected. Data quality checks or validation artifacts detected. Notebook or research workflow detected.')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'api')).toBeUndefined()
  })

  it('shapes frontend and api blocks for angular and aspnetcore style repos', () => {
    const graph: CtxGraph = {
      rootDir: '/repo',
      facts: [
        { kind: 'framework', source: 'package.json', confidence: 1, data: { name: 'angular' } },
        { kind: 'convention', source: 'angular.json', confidence: 1, data: { tool: 'angular-cli', path: 'angular.json' } },
        { kind: 'convention', source: 'src/App.tsx', confidence: 1, data: { tool: 'app-root', path: 'src/App.tsx' } },
        { kind: 'convention', source: 'src/config/tables/research.ts', confidence: 1, data: { tool: 'table-config', path: 'src/config/tables/research.ts' } },
        { kind: 'convention', source: 'src/config/themesConfig.ts', confidence: 1, data: { tool: 'theme-config', path: 'src/config/themesConfig.ts' } },
        { kind: 'convention', source: 'src/flags.ts', confidence: 1, data: { tool: 'feature-flags', path: 'src/flags.ts' } },
        { kind: 'convention', source: 'src/store/actions/research.actions.ts', confidence: 1, data: { tool: 'state', path: 'src/store/actions/research.actions.ts' } },
        { kind: 'api', source: 'src/services/research.service.ts', confidence: 1, data: { name: 'http-client', path: 'src/services/research.service.ts' } },
        { kind: 'test-runner', source: 'src/pages/research/research.component.spec.ts', confidence: 1, data: { name: 'karma' } },
        { kind: 'runtime', source: 'src/Api/Program.cs', confidence: 1, data: { name: 'dotnet' } },
        { kind: 'framework', source: 'src/Api/App.csproj', confidence: 1, data: { name: 'aspnetcore' } },
        { kind: 'route', source: 'src/Api/Program.cs', confidence: 0.9, data: { kind: 'api-module', path: '/health', file: 'src/Api/Program.cs' } },
      ],
      apps: [],
      packages: [],
      relationships: [
        { from: 'src/pages/research/research.component.ts', to: 'src/helpers/format.helper.ts', type: 'imports' },
        { from: 'src/pages/dashboard/dashboard.component.ts', to: 'src/helpers/format.helper.ts', type: 'imports' },
      ],
      ctxBlocks: {},
    }

    const ctxBlocks = planCtxBlocks(graph, createConfig())

    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('Frontend implementation shape: Angular workspace and component structure detected.')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('Frontend change-analysis signals:')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('config-driven UI: src/config/tables/research.ts, src/config/themesConfig.ts')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('feature flags: src/flags.ts')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('import hotspots: src/helpers/format.helper.ts (2 imports)')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('Inspect config-driven UI surfaces before changing downstream components')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('`src/config/tables/research.ts`: Config-driven UI surface')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'frontend')?.content).toContain('`angular.json`: Frontend framework or build config')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'api')?.content).toContain('API implementation shape: ASP.NET Core application host detected.')
    expect(ctxBlocks.find((ctxBlock) => ctxBlock.name === 'api')?.content).toContain('`src/Api/Program.cs`: API runtime entrypoint')
  })

  it('fits context-block output to the configured budget', () => {
    const graph: CtxGraph = {
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
      ctxBlocks: {},
    }

    const ctxBlocks = planCtxBlocks(graph, createConfig('small'))
    const totalTokens = ctxBlocks.reduce((sum, ctxBlock) => sum + ctxBlock.tokenEstimate, 0)

    expect(totalTokens).toBeLessThanOrEqual(20)
  })
})
