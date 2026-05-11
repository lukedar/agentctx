import path from 'node:path'

import type {
  AgentCtxPlugin,
  DetectionResult,
  Fact,
  OperationalFactKind,
  ScanContext,
  VisibilityClass,
} from '@agentctx/core'

import { getAllDeps, listPackageJsonPaths, readPackageJsonSafe } from '../utils/packageJson'

type OperationalDomain =
  | 'node-typescript'
  | 'angular'
  | 'dotnet'
  | 'react'
  | 'next'
  | 'shared-contracts'
  | 'workers'
  | 'infrastructure'

type OperationalFactInput = Readonly<{
  operationalKind: OperationalFactKind
  domain: OperationalDomain
  source: string
  summary: string
  adapter: string
  confidence?: number
  visibility?: VisibilityClass
  reason?: string
}>

const uniqueBy = <T>(items: readonly T[], key: (item: T) => string): readonly T[] => {
  const seen = new Set<string>()
  const out: T[] = []

  for (const item of items) {
    const itemKey = key(item)
    if (seen.has(itemKey)) continue
    seen.add(itemKey)
    out.push(item)
  }

  return out
}

const fact = (input: OperationalFactInput): Fact => ({
  kind: 'operational',
  source: input.source,
  confidence: input.confidence ?? 0.75,
  data: {
    operationalKind: input.operationalKind,
    domain: input.domain,
    summary: input.summary,
    adapter: input.adapter,
    visibility: input.visibility ?? 'internal',
    ...(input.reason ? { reason: input.reason } : {}),
    evidence: [{ source: input.source, reason: input.reason ?? input.summary }],
  },
})

const hasDep = (deps: Readonly<Record<string, string>>, names: readonly string[]): boolean =>
  names.some((name) => Boolean(deps[name]))

const packageRoot = (packageJsonPath: string): string => {
  const dir = path.posix.dirname(packageJsonPath)
  return dir === '.' ? '.' : dir
}

const contextPaths = (ctx: ScanContext): readonly string[] => ctx.paths ?? ctx.files.files.map((file) => file.path)

const contextBasename = (ctx: ScanContext, filePath: string): string =>
  ctx.basenames?.[filePath] ?? path.posix.basename(filePath)

const fileIncludes = async (ctx: ScanContext, filePath: string, tokens: readonly string[]): Promise<boolean> => {
  try {
    const content = await ctx.readText(filePath)
    return tokens.some((token) => content.includes(token))
  } catch {
    return false
  }
}

const packageFacts = async (ctx: ScanContext): Promise<readonly Fact[]> => {
  const out: Fact[] = []

  for (const packageJsonPath of listPackageJsonPaths(ctx)) {
    const pkg = await readPackageJsonSafe(ctx, packageJsonPath)
    if (!pkg) continue

    const deps = getAllDeps(pkg)
    const root = packageRoot(packageJsonPath)
    const scripts = pkg.scripts ?? {}
    const packageLabel = pkg.name ?? root

    for (const scriptName of ['build', 'test', 'lint', 'typecheck', 'dev', 'start', 'ci'] as const) {
      const command = scripts[scriptName]
      if (!command) continue
      out.push(fact({
        operationalKind: 'safe-command',
        domain: 'node-typescript',
        source: packageJsonPath,
        summary: `${packageLabel} exposes ${scriptName}: ${command}`,
        adapter: 'node-typescript',
        visibility: 'public',
        reason: 'package script',
      }))
    }

    if (pkg.workspaces) {
      out.push(fact({
        operationalKind: 'invariant',
        domain: 'node-typescript',
        source: packageJsonPath,
        summary: 'Workspace package relationships should be treated as source-of-truth dependency direction.',
        adapter: 'node-typescript',
        visibility: 'public',
        reason: 'workspace manifest',
      }))
    }

    if (hasDep(deps, ['typescript', 'ts-node', 'tsx'])) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'node-typescript',
        source: packageJsonPath,
        summary: `${packageLabel} is a TypeScript execution or build boundary.`,
        adapter: 'node-typescript',
        visibility: 'public',
      }))
    }

    if (hasDep(deps, ['next'])) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'next',
        source: packageJsonPath,
        summary: `${packageLabel} combines frontend, server rendering, and route/API runtime boundaries through Next.js.`,
        adapter: 'next',
        visibility: 'public',
      }))
    }

    if (hasDep(deps, ['react', 'react-dom'])) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'react',
        source: packageJsonPath,
        summary: `${packageLabel} owns component-driven frontend behavior.`,
        adapter: 'react',
        visibility: 'public',
      }))
    }

    if (hasDep(deps, ['@angular/core'])) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'angular',
        source: packageJsonPath,
        summary: `${packageLabel} owns Angular module, route, component, and dependency-injection boundaries.`,
        adapter: 'angular',
        visibility: 'public',
      }))
    }

    if (hasDep(deps, ['bullmq', 'bull', '@nestjs/bull', '@nestjs/bullmq', 'amqplib', 'kafkajs', '@aws-sdk/client-sqs'])) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'workers',
        source: packageJsonPath,
        summary: `${packageLabel} has queue or worker runtime dependencies.`,
        adapter: 'workers',
        reason: 'queue dependency',
      }))
      out.push(fact({
        operationalKind: 'failure-mode',
        domain: 'workers',
        source: packageJsonPath,
        summary: 'Queue handlers need explicit retry and idempotency boundaries to avoid duplicate side effects.',
        adapter: 'workers',
        reason: 'queue dependency',
      }))
    }

    if (hasDep(deps, ['zod', 'graphql', '@graphql-codegen/cli', 'protobufjs', 'openapi-typescript'])) {
      out.push(fact({
        operationalKind: 'invariant',
        domain: 'shared-contracts',
        source: packageJsonPath,
        summary: `${packageLabel} contains shared contract tooling; producers and consumers should change together.`,
        adapter: 'shared-contracts',
        visibility: 'public',
      }))
    }
  }

  return out
}

const pathFacts = async (ctx: ScanContext): Promise<readonly Fact[]> => {
  const out: Fact[] = []

  for (const filePath of contextPaths(ctx)) {
    const base = contextBasename(ctx, filePath)
    const lower = filePath.toLowerCase()

    if (base.endsWith('.guard.ts')) {
      out.push(fact({
        operationalKind: 'security-boundary',
        domain: 'angular',
        source: filePath,
        summary: `${filePath} is an Angular route or permission guard boundary.`,
        adapter: 'angular',
        reason: 'guard file',
      }))
    }

    if (base.endsWith('.interceptor.ts') && (lower.includes('auth') || await fileIncludes(ctx, filePath, ['Authorization', 'JWT', 'Bearer']))) {
      out.push(fact({
        operationalKind: 'security-boundary',
        domain: 'angular',
        source: filePath,
        summary: `${filePath} participates in Angular auth or request-header handling.`,
        adapter: 'angular',
        reason: 'auth interceptor',
      }))
    }

    if (lower.includes('/store/') || base.endsWith('.reducer.ts') || base.endsWith('.effects.ts') || base.endsWith('.selectors.ts')) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'angular',
        source: filePath,
        summary: `${filePath} is a frontend state ownership surface.`,
        adapter: 'angular',
        visibility: 'public',
      }))
    }

    if (base === 'page.tsx' || base === 'page.jsx' || base === 'layout.tsx' || base === 'layout.jsx') {
      out.push(fact({
        operationalKind: 'execution-path',
        domain: 'next',
        source: filePath,
        summary: `${filePath} is a Next.js App Router surface.`,
        adapter: 'next',
        visibility: 'public',
      }))
    }

    if (base === 'route.ts' || base === 'route.js') {
      out.push(fact({
        operationalKind: 'execution-path',
        domain: lower.includes('/app/api/') ? 'next' : 'node-typescript',
        source: filePath,
        summary: `${filePath} is a route handler execution path.`,
        adapter: lower.includes('/app/api/') ? 'next' : 'node-typescript',
        visibility: 'public',
      }))
    }

    if ((base.endsWith('.tsx') || base.endsWith('.jsx')) && await fileIncludes(ctx, filePath, ['use client'])) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'next',
        source: filePath,
        summary: `${filePath} is an explicit client component boundary.`,
        adapter: 'next',
        visibility: 'public',
      }))
    }

    if (base.endsWith('Controller.cs') || lower.includes('/controllers/')) {
      out.push(fact({
        operationalKind: 'execution-path',
        domain: 'dotnet',
        source: filePath,
        summary: `${filePath} is an ASP.NET API controller boundary.`,
        adapter: 'dotnet',
        visibility: 'public',
      }))
    }

    if (base === 'Program.cs' && await fileIncludes(ctx, filePath, ['UseAuthentication', 'UseAuthorization'])) {
      out.push(fact({
        operationalKind: 'invariant',
        domain: 'dotnet',
        source: filePath,
        summary: 'ASP.NET auth middleware ordering must preserve authentication before authorization.',
        adapter: 'dotnet',
        reason: 'auth middleware',
      }))
    }

    if (base.endsWith('.csproj') && await fileIncludes(ctx, filePath, ['EntityFrameworkCore', 'Npgsql', 'SqlServer'])) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'dotnet',
        source: filePath,
        summary: `${filePath} has .NET data-access dependencies.`,
        adapter: 'dotnet',
      }))
    }

    if (base.endsWith('.csproj') && await fileIncludes(ctx, filePath, ['Hangfire', 'Quartz'])) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'workers',
        source: filePath,
        summary: `${filePath} has .NET background worker scheduling dependencies.`,
        adapter: 'workers',
      }))
    }

    if (
      base === 'openapi.yaml' ||
      base === 'openapi.yml' ||
      base === 'openapi.json' ||
      base === 'schema.graphql' ||
      base === 'schema.gql' ||
      base.endsWith('.proto')
    ) {
      out.push(fact({
        operationalKind: 'invariant',
        domain: 'shared-contracts',
        source: filePath,
        summary: `${filePath} is a source-of-truth shared contract surface.`,
        adapter: 'shared-contracts',
        visibility: 'public',
      }))
      out.push(fact({
        operationalKind: 'risk',
        domain: 'shared-contracts',
        source: filePath,
        summary: 'Contract changes can break downstream consumers unless generated clients, validators, and tests change together.',
        adapter: 'shared-contracts',
        visibility: 'public',
      }))
    }

    if (/(\b|\/)(worker|workers|queue|queues|job|jobs|cron|scheduler|schedules)(\/|\.|-)/i.test(filePath)) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'workers',
        source: filePath,
        summary: `${filePath} is a worker, queue, job, or scheduler surface.`,
        adapter: 'workers',
      }))
    }

    if (/retry|retries|idempot/i.test(filePath)) {
      out.push(fact({
        operationalKind: 'invariant',
        domain: 'workers',
        source: filePath,
        summary: `${filePath} likely controls retry or idempotency behavior.`,
        adapter: 'workers',
      }))
    }

    if (
      base === 'Dockerfile' ||
      base.startsWith('Dockerfile.') ||
      base === 'docker-compose.yml' ||
      base === 'docker-compose.yaml' ||
      base.endsWith('.tf') ||
      base === 'Chart.yaml' ||
      filePath.startsWith('.github/workflows/') ||
      lower.includes('/k8s/') ||
      lower.includes('/kubernetes/') ||
      lower.includes('/helm/')
    ) {
      out.push(fact({
        operationalKind: 'runtime-boundary',
        domain: 'infrastructure',
        source: filePath,
        summary: `${filePath} is an infrastructure, deployment, or CI boundary.`,
        adapter: 'infrastructure',
      }))
      out.push(fact({
        operationalKind: 'risk',
        domain: 'infrastructure',
        source: filePath,
        summary: 'Infrastructure and deployment changes can affect environments beyond the edited files.',
        adapter: 'infrastructure',
      }))
    }
  }

  return out
}

const extractOperationalFacts = async (ctx: ScanContext): Promise<readonly Fact[]> => {
  const facts = [...await packageFacts(ctx), ...await pathFacts(ctx)]
  return [...uniqueBy(facts, (item) =>
    `${item.data.operationalKind}:${item.data.domain}:${item.source}:${item.data.summary}`,
  )].sort((left, right) => {
    const sourceOrder = left.source.localeCompare(right.source)
    if (sourceOrder !== 0) return sourceOrder
    return String(left.data.summary).localeCompare(String(right.data.summary))
  })
}

export const operationalFrameworkFactsPlugin: AgentCtxPlugin = {
  name: 'operational-framework-facts',

  async extractWithDetection(ctx): Promise<Readonly<{
    detection: DetectionResult
    facts: readonly Fact[]
  }>> {
    const facts = await extractOperationalFacts(ctx)
    return {
      detection: {
        detected: facts.length > 0,
        confidence: facts.length > 0 ? 0.7 : 0,
        reason: facts.length > 0
          ? `Extracted ${facts.length} operational framework facts`
          : 'No operational framework facts found',
      },
      facts,
    }
  },

  async detect(ctx): Promise<DetectionResult> {
    const facts = await extractOperationalFacts(ctx)
    return {
      detected: facts.length > 0,
      confidence: facts.length > 0 ? 0.7 : 0,
      reason: facts.length > 0
        ? `Extracted ${facts.length} operational framework facts`
        : 'No operational framework facts found',
    }
  },

  async extract(ctx: ScanContext): Promise<readonly Fact[]> {
    return extractOperationalFacts(ctx)
  },
}
