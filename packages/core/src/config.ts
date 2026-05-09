import { existsSync } from 'node:fs'
import path from 'node:path'

import { createJiti } from 'jiti'
import { z } from 'zod'

import type { AgentCtxConfig, Result, TargetName, TokenBudgetName } from './types'

export const DEFAULT_INCLUDE = [
  // High-value repo metadata
  'package.json',
  'pnpm-workspace.yaml',
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  'tsconfig.json',
  'jsconfig.json',
  '**/package.json',
  '**/tsconfig.json',
  '**/jsconfig.json',

  // Python
  'pyproject.toml',
  'requirements*.txt',
  'Pipfile',
  'poetry.lock',
  'uv.lock',
  'setup.py',
  'setup.cfg',

  // .NET
  '*.sln',
  '*.slnx',
  'Directory.Build.props',
  'Directory.Build.targets',
  '**/*.csproj',
  '**/*.fsproj',
  '**/*.vbproj',

  // Common code/docs locations
  'apps/**',
  'packages/**',
  'src/**',
  'app/**',
  'services/**',
  'libs/**',
  'README.md',
  'docs/**',

  // Infrastructure, automation, and data workflow markers
  'infra/**',
  'infrastructure/**',
  'ops/**',
  'deploy/**',
  'k8s/**',
  'helm/**',
  'charts/**',
  'Dockerfile*',
  'docker-compose*.yml',
  '.github/workflows/**',
  '.gitlab-ci.yml',
  'azure-pipelines.yml',
  'dbt_project.yml',
  'dags/**',
  'notebooks/**',
  'data/**',
  '.env.example',
  '**/.env.example',
] as const

export const DEFAULT_EXCLUDE = [
  '.agentctx/**',
  'node_modules/**',
  'dist/**',
  'build/**',
  'dist-server/**',
  '.next/**',
  'coverage/**',
  '.cache/**',
  '.turbo/**',
  '.parcel-cache/**',
  '.venv/**',
  'venv/**',
  '__pycache__/**',
  '.pytest_cache/**',
  '.mypy_cache/**',
  '.ruff_cache/**',
  'bin/**',
  'obj/**',
  '.terraform/**',
  '.gradle/**',
  'target/**',
  '.git/**',
  '.vitepress/cache/**',
  '.vitepress/dist/**',
  '**/.agentctx/**',
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/dist-server/**',
  '**/.next/**',
  '**/coverage/**',
  '**/.cache/**',
  '**/.turbo/**',
  '**/.parcel-cache/**',
  '**/.venv/**',
  '**/venv/**',
  '**/__pycache__/**',
  '**/.pytest_cache/**',
  '**/.mypy_cache/**',
  '**/.ruff_cache/**',
  '**/bin/**',
  '**/obj/**',
  '**/.terraform/**',
  '**/.gradle/**',
  '**/target/**',
  '**/.vitepress/cache/**',
  '**/.vitepress/dist/**',
  '**/*.lock',
  '**/.env*',
  '**/*.pem',
  '**/*.key',
] as const

const targetNameSchema = z.enum([
  'agents-md',
  'claude',
  'cursor',
  'copilot',
  'llms',
] satisfies readonly [TargetName, ...TargetName[]])

const tokenBudgetNameSchema = z.enum(['small', 'medium', 'large'] satisfies readonly [
  TokenBudgetName,
  ...TokenBudgetName[]
])

const ctxPointSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  type: z
    .enum(['frontend', 'backend', 'worker', 'package', 'infra', 'docs', 'unknown'])
    .optional(),
  frameworks: z.array(z.string()).optional(),
  dependsOn: z.array(z.string()).optional(),
  targets: z.array(targetNameSchema).min(1).optional(),
  budget: tokenBudgetNameSchema.optional(),
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
})

const configSchema = z.object({
  rootDir: z.string().optional(),

  workspace: z
    .object({
      name: z.string().optional(),
      root: z.string().optional(),
      packageManager: z.enum(['pnpm', 'npm', 'yarn', 'unknown']).optional(),
    })
    .optional(),

  ctxPoints: z.array(ctxPointSchema).optional(),

  targets: z.array(targetNameSchema).min(1).optional(),
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  ctxBlocks: z
    .object({
      architecture: z.boolean().optional(),
      conventions: z.boolean().optional(),
      runtime: z.boolean().optional(),
      api: z.boolean().optional(),
      database: z.boolean().optional(),
      operations: z.boolean().optional(),
      data: z.boolean().optional(),
      frontend: z.boolean().optional(),
      testing: z.boolean().optional(),
      workflows: z.boolean().optional(),
      glossary: z.boolean().optional(),
    })
    .optional(),
  budgets: z
    .object({
      default: tokenBudgetNameSchema.optional(),
      small: z.number().int().positive().optional(),
      medium: z.number().int().positive().optional(),
      large: z.number().int().positive().optional(),
    })
    .optional(),
  drift: z
    .object({
      failOnCheck: z.boolean().optional(),
      thresholdPercent: z.number().int().min(0).max(100).optional(),
    })
    .optional(),
  security: z
    .object({
      redactSecrets: z.boolean().optional(),
      includeEnvValues: z.boolean().optional(),
      allowSourceSnippets: z.boolean().optional(),
    })
    .optional(),
})

export type UserAgentCtxConfig = z.infer<typeof configSchema>

export const defineConfig = <T extends UserAgentCtxConfig>(config: T): T => config

const normalizeWorkspace = (w: UserAgentCtxConfig['workspace']): AgentCtxConfig['workspace'] => {
  if (!w) return undefined

  return {
    ...(w.name ? { name: w.name } : {}),
    ...(w.root ? { root: w.root } : {}),
    ...(w.packageManager ? { packageManager: w.packageManager } : {}),
  }
}

const normalizeCtxPoints = (points: UserAgentCtxConfig['ctxPoints']): AgentCtxConfig['ctxPoints'] => {
  const input = points ?? []

  return input.map((p) => ({
    name: p.name,
    path: p.path,
    ...(p.type ? { type: p.type } : {}),
    ...(p.frameworks ? { frameworks: p.frameworks } : {}),
    ...(p.dependsOn ? { dependsOn: p.dependsOn } : {}),
    ...(p.targets ? { targets: p.targets } : {}),
    ...(p.budget ? { budget: p.budget } : {}),
    ...(p.include ? { include: p.include } : {}),
    ...(p.exclude ? { exclude: p.exclude } : {}),
  }))
}

const applyDefaults = (rootDir: string, user: UserAgentCtxConfig): AgentCtxConfig => {
  const workspace = normalizeWorkspace(user.workspace)
  const ctxPoints = normalizeCtxPoints(user.ctxPoints)
  const ctxBlocks = {
    architecture: user.ctxBlocks?.architecture ?? true,
    conventions: user.ctxBlocks?.conventions ?? true,
    runtime: user.ctxBlocks?.runtime ?? true,
    api: user.ctxBlocks?.api ?? true,
    database: user.ctxBlocks?.database ?? true,
    operations: user.ctxBlocks?.operations ?? true,
    data: user.ctxBlocks?.data ?? true,
    frontend: user.ctxBlocks?.frontend ?? true,
    testing: user.ctxBlocks?.testing ?? true,
    workflows: user.ctxBlocks?.workflows ?? true,
    glossary: user.ctxBlocks?.glossary ?? true,
  }

  const base: Omit<AgentCtxConfig, 'workspace'> = {
    rootDir: user.rootDir ?? rootDir,
    scope: { kind: 'workspace' },
    ctxPoints,

    targets: user.targets ?? ['agents-md', 'claude', 'cursor', 'copilot', 'llms'],
    include: user.include ?? [...DEFAULT_INCLUDE],
    exclude: user.exclude ?? [...DEFAULT_EXCLUDE],
    ctxBlocks,
    budgets: {
      default: user.budgets?.default ?? 'large',
      small: user.budgets?.small ?? 4_000,
      medium: user.budgets?.medium ?? 12_000,
      large: user.budgets?.large ?? 32_000,
    },
    drift: {
      failOnCheck: user.drift?.failOnCheck ?? true,
      thresholdPercent: user.drift?.thresholdPercent ?? 10,
    },
    security: {
      redactSecrets: user.security?.redactSecrets ?? true,
      includeEnvValues: user.security?.includeEnvValues ?? false,
      allowSourceSnippets: user.security?.allowSourceSnippets ?? false,
    },
  }

  return {
    ...base,
    ...(workspace ? { workspace } : {}),
  }
}

export const loadConfig = async (rootDir: string): Promise<Result<AgentCtxConfig>> => {
  const configPathTs = path.join(rootDir, 'agentctx.config.ts')
  const configPathJs = path.join(rootDir, 'agentctx.config.js')

  const configPath = existsSync(configPathTs)
    ? configPathTs
    : existsSync(configPathJs)
      ? configPathJs
      : undefined

  if (!configPath) {
    return {
      ok: false,
      error: {
        code: 'config_not_found',
        message: 'No agentctx.config.ts or agentctx.config.js found',
        details: { rootDir },
      },
    }
  }

  try {
    const jiti = createJiti(configPath, { interopDefault: true })
    const modUnknown: unknown = await jiti.import(configPath)

    const raw: unknown =
      typeof modUnknown === 'object' && modUnknown !== null && 'default' in modUnknown
        ? (modUnknown as { default: unknown }).default
        : modUnknown

    const parsed = configSchema.safeParse(raw)
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: 'config_invalid',
          message: 'Invalid agentctx config',
          details: parsed.error.flatten(),
        },
      }
    }

    return { ok: true, value: applyDefaults(rootDir, parsed.data) }
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'config_load_failed',
        message: 'Failed to load agentctx config',
        cause: err,
        details: { rootDir, configPath },
      },
    }
  }
}
