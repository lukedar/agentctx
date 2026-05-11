import type {
  AgentCtxConfig,
  ContextFileCapability,
  ContextFileCategory,
  ContextFileDefinition,
  ContextFilesConfig,
  CtxGraph,
  Fact,
  RenderedContextFile,
} from './types'
import { createCtxFactIndex } from './ctxBlockFacts'
import { estimateTokens } from './ctxBlocks'

const CORE_CONTEXT_FILES = [
  ['overview', 800, 100, true],
  ['architecture', 1600, 98, true],
  ['conventions', 1200, 96, true],
  ['commands', 900, 94, true],
  ['dependencies', 1200, 92, true],
  ['testing', 1300, 90, true],
  ['security', 1200, 99, false],
  ['boundaries', 1000, 97, false],
] as const

const definition = (
  name: string,
  category: ContextFileCategory,
  requiredCapabilities: readonly ContextFileCapability[],
  maxTokens: number,
  priority: number,
  publicSafe: boolean,
): ContextFileDefinition => ({
  name,
  category,
  requiredCapabilities,
  maxTokens,
  priority,
  publicSafe,
})

export const contextFileRegistry: readonly ContextFileDefinition[] = [
  ...CORE_CONTEXT_FILES.map(([name, maxTokens, priority, publicSafe]) =>
    definition(name, 'core', [], maxTokens, priority, publicSafe),
  ),
  definition('workspace', 'root', [], 1200, 90, true),
  definition('mesh', 'root', [], 1200, 88, true),
  definition('ownership', 'root', [], 900, 84, false),
  definition('global-commands', 'root', [], 900, 86, true),
  definition('release', 'root', [], 1000, 80, false),
  definition('routes', 'frontend', ['frontend', 'routing'], 1600, 82, true),
  definition('components', 'frontend', ['frontend', 'components'], 1400, 76, true),
  definition('state', 'frontend', ['frontend', 'state'], 1400, 78, true),
  definition('styling', 'frontend', ['frontend'], 1000, 60, true),
  definition('accessibility', 'frontend', ['frontend'], 900, 58, true),
  definition('forms', 'frontend', ['frontend'], 900, 56, true),
  definition('api-client', 'frontend', ['frontend', 'api'], 1400, 80, true),
  definition('api', 'backend', ['api'], 1800, 84, true),
  definition('auth', 'backend', ['auth'], 1400, 82, false),
  definition('database', 'backend', ['database'], 1800, 80, false),
  definition('middleware', 'backend', ['api'], 1000, 62, true),
  definition('validation', 'backend', ['api'], 1100, 68, true),
  definition('errors', 'backend', ['api'], 1000, 66, true),
  definition('observability', 'backend', ['api'], 1000, 54, true),
  definition('jobs', 'worker', ['worker'], 1200, 78, true),
  definition('queues', 'worker', ['queue'], 1400, 76, false),
  definition('scheduling', 'worker', ['worker'], 900, 58, true),
  definition('retries', 'worker', ['worker'], 900, 70, true),
  definition('idempotency', 'worker', ['worker'], 900, 68, true),
  definition('exports', 'package', ['shared-package'], 1000, 78, true),
  definition('schemas', 'package', ['schemas'], 1600, 76, true),
  definition('versioning', 'package', ['shared-package'], 900, 56, true),
  definition('compatibility', 'package', ['shared-package'], 1000, 74, true),
  definition('public-api', 'package', ['shared-package'], 1200, 80, true),
  definition('usage', 'package', ['shared-package'], 1000, 62, true),
  definition('schema', 'data', ['database'], 1400, 70, false),
  definition('migrations', 'data', ['database'], 1100, 68, false),
  definition('queries', 'data', ['database'], 1000, 58, false),
  definition('seed-data', 'data', ['database'], 900, 52, false),
  definition('data-access', 'data', ['database'], 1100, 66, true),
  definition('deployments', 'infra', ['deployment'], 1200, 70, false),
  definition('environments', 'infra', ['infrastructure'], 1000, 66, false),
  definition('secrets', 'infra', ['infrastructure'], 1000, 90, false),
  definition('ci-cd', 'infra', ['ci'], 1000, 72, true),
  definition('permissions', 'infra', ['infrastructure'], 1000, 68, false),
]

const uniq = <T>(items: readonly T[]): readonly T[] => [...new Set(items)]

const sortedByPriority = (
  definitions: readonly ContextFileDefinition[],
): readonly ContextFileDefinition[] =>
  [...definitions].sort((a, b) => b.priority - a.priority || a.category.localeCompare(b.category) || a.name.localeCompare(b.name))

const strings = (facts: readonly Fact[], kind: Fact['kind'], key: string): readonly string[] =>
  uniq(
    facts
      .filter((fact) => fact.kind === kind)
      .map((fact) => fact.data[key])
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => value.trim()),
  )

const hasFact = (facts: readonly Fact[], kind: Fact['kind']): boolean =>
  facts.some((fact) => fact.kind === kind)

const hasPath = (facts: readonly Fact[], match: (source: string) => boolean): boolean =>
  facts.some((fact) => match(fact.source))

export const detectContextFileCapabilities = (
  graph: CtxGraph,
  config: AgentCtxConfig,
): readonly ContextFileCapability[] => {
  const facts = graph.facts
  const frameworks = new Set([
    ...strings(facts, 'framework', 'name'),
    ...(config.scope?.kind === 'point' ? config.scope.frameworks ?? [] : []),
  ].map((name) => name.toLowerCase()))
  const runtimeNames = new Set(strings(facts, 'runtime', 'name').map((name) => name.toLowerCase()))
  const packageNames = strings(facts, 'package', 'name')
  const dependencyNames = strings(facts, 'dependency', 'name').map((name) => name.toLowerCase())
  const operationalDomains = new Set(
    facts
      .filter((fact) => fact.kind === 'operational')
      .map((fact) => fact.data.domain)
      .filter((domain): domain is string => typeof domain === 'string')
      .map((domain) => domain.toLowerCase()),
  )
  const operationalKinds = new Set(
    facts
      .filter((fact) => fact.kind === 'operational')
      .map((fact) => fact.data.operationalKind)
      .filter((kind): kind is string => typeof kind === 'string')
      .map((kind) => kind.toLowerCase()),
  )
  const hasOperational = (domain: string, kind?: string): boolean =>
    facts.some((fact) =>
      fact.kind === 'operational' &&
      fact.data.domain === domain &&
      (kind === undefined || fact.data.operationalKind === kind),
    )
  const scopeType = config.scope?.kind === 'point' ? config.scope.type : undefined

  const frontendFrameworks = ['react', 'next', 'angular', 'vue', 'svelte', 'sveltekit', 'solid', 'nuxt', 'astro', 'remix', 'vite']
  const apiFrameworks = ['express', 'fastify', 'nestjs', 'hono', 'aspnetcore', 'fastapi', 'django', 'flask', 'rails', 'laravel']

  const out: ContextFileCapability[] = []
  const add = (capability: ContextFileCapability, detected: boolean) => {
    if (detected) out.push(capability)
  }

  add('frontend', frontendFrameworks.some((name) => frameworks.has(name)) || scopeType === 'frontend' || operationalDomains.has('react') || operationalDomains.has('angular') || operationalDomains.has('next'))
  add('routing', hasFact(facts, 'route') || operationalKinds.has('execution-path'))
  add('components', hasPath(facts, (source) => /(^|\/)(components|pages|app|src)\//.test(source)))
  add('state', dependencyNames.some((name) => ['redux', '@reduxjs/toolkit', 'zustand', 'pinia', 'vuex', '@ngrx/store', 'jotai', 'recoil'].includes(name)) || hasPath(facts, (source) => /(^|\/)(store|state)\//.test(source)))
  add('api', hasFact(facts, 'api') || apiFrameworks.some((name) => frameworks.has(name)) || scopeType === 'backend')
  add('auth', hasFact(facts, 'auth') || operationalKinds.has('security-boundary') || hasPath(facts, (source) => source.toLowerCase().includes('auth')))
  add('database', hasFact(facts, 'database') || hasOperational('dotnet', 'runtime-boundary'))
  add('worker', scopeType === 'worker' || operationalDomains.has('workers') || hasPath(facts, (source) => /(worker|job|cron|schedule|queue)/i.test(source)))
  add('queue', operationalDomains.has('workers') || hasPath(facts, (source) => /(queue|bull|sqs|rabbit|kafka)/i.test(source)))
  add('shared-package', scopeType === 'package' || packageNames.length > 0 || operationalDomains.has('shared-contracts'))
  add('schemas', hasFact(facts, 'data') || operationalDomains.has('shared-contracts') || hasPath(facts, (source) => /(schema|contract|openapi|proto)/i.test(source)))
  add('infrastructure', scopeType === 'infra' || operationalDomains.has('infrastructure') || hasFact(facts, 'operations') || hasPath(facts, (source) => /(^|\/)(infra|infrastructure|ops|k8s|helm|charts|\.github\/workflows)\//.test(source)))
  add('deployment', operationalDomains.has('infrastructure') || hasFact(facts, 'operations') || hasPath(facts, (source) => /(Dockerfile|docker-compose|deploy|terraform|pulumi|kubernetes|helm)/i.test(source)))
  add('ci', hasPath(facts, (source) => /(^|\/)(\.github\/workflows|\.gitlab-ci|azure-pipelines)/.test(source)))

  if (runtimeNames.has('node')) add('api', hasFact(facts, 'api'))

  return uniq(out)
}

export const getContextFileDefinition = (name: string): ContextFileDefinition | undefined =>
  contextFileRegistry.find((definition) => definition.name === name)

const configNames = (config?: ContextFilesConfig, key?: keyof ContextFilesConfig): readonly string[] => {
  if (!config || !key) return []
  const value = config[key]
  return value ? [...value] : []
}

const isSafetyFile = (name: string): boolean => name === 'security' || name === 'boundaries'

export const selectContextFiles = (
  input: {
    graph: CtxGraph
    config: AgentCtxConfig
    capabilities?: readonly ContextFileCapability[]
    registry?: readonly ContextFileDefinition[]
    categories?: readonly ContextFileCategory[]
    files?: readonly string[]
  },
): readonly ContextFileDefinition[] => {
  const registry = input.registry ?? contextFileRegistry
  const capabilities = new Set(input.capabilities ?? detectContextFileCapabilities(input.graph, input.config))
  const categories = input.categories ? new Set(input.categories) : undefined
  const files = input.files ? new Set(input.files) : undefined
  const contextConfig = input.config.contextFiles
  const include = new Set(configNames(contextConfig, 'include'))
  const required = new Set(configNames(contextConfig, 'required'))
  const exclude = new Set(configNames(contextConfig, 'exclude'))
  const isWorkspace = input.config.scope?.kind !== 'point'

  const selected = registry.filter((candidate) => {
    if (candidate.category === 'root' && !isWorkspace && !include.has(candidate.name) && !required.has(candidate.name)) return false
    if (candidate.category === 'root' && isWorkspace) return true
    if (candidate.category === 'core') return true
    if (include.has(candidate.name) || required.has(candidate.name)) return true
    return candidate.requiredCapabilities.every((capability) => capabilities.has(capability))
  })

  const filtered = selected.filter((candidate) => {
    if (categories && !categories.has(candidate.category)) return false
    if (files && !files.has(candidate.name)) return false
    if (required.has(candidate.name)) return true
    if (!exclude.has(candidate.name)) return true
    if (isSafetyFile(candidate.name) && !input.config.allowUnsafeContextConfig) return true
    return false
  })

  return sortedByPriority(uniq(filtered))
}

const titleFor = (name: string): string =>
  name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const listOrNone = (items: readonly string[], empty = '(none detected)'): string =>
  items.length ? items.join(', ') : empty

const section = (title: string, lines: readonly string[]): string =>
  [`## ${title}`, '', ...(lines.length ? lines : ['_(none detected)_']), ''].join('\n')

const bulletSection = (title: string, lines: readonly string[]): string =>
  section(title, lines.length ? lines.map((line) => (line.startsWith('- ') ? line : `- ${line}`)) : [])

const factsByPath = (facts: readonly Fact[], kind: Fact['kind'], key: string): readonly string[] => {
  const values = facts
    .filter((fact) => fact.kind === kind)
    .map((fact) => fact.data[key] ?? fact.source)
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim())
  return [...new Set(values)].sort((a, b) => a.localeCompare(b)).slice(0, 8)
}

const renderBody = (
  definition: ContextFileDefinition,
  graph: CtxGraph,
  config: AgentCtxConfig,
  capabilities: readonly ContextFileCapability[],
): string => {
  const factIndex = createCtxFactIndex(graph.facts)
  const scope = config.scope?.kind === 'point' ? `point \`${config.scope.name}\` at \`${config.scope.path}\`` : 'workspace'
  const frameworks = factIndex.strings('framework', 'name')
  const languages = factIndex.strings('language', 'name')
  const scripts = factIndex.strings('script', 'name')
  const packageManagers = factIndex.strings('package-manager', 'name')
  const testRunners = factIndex.strings('test-runner', 'name')
  const dependencies = factIndex.strings('dependency', 'name').slice(0, 12)
  const routes = factsByPath(graph.facts, 'route', 'file')
  const apiFiles = factsByPath(graph.facts, 'api', 'path')
  const databaseFiles = factsByPath(graph.facts, 'database', 'path')
  const operationFiles = factsByPath(graph.facts, 'operations', 'path')
  const dataFiles = factsByPath(graph.facts, 'data', 'path')
  const operationalFacts = graph.facts.filter((fact) => fact.kind === 'operational')
  const operationalDomainsFor = (name: string): readonly string[] | undefined => {
    switch (name) {
      case 'overview':
      case 'architecture':
      case 'workspace':
      case 'mesh':
        return undefined
      case 'commands':
      case 'global-commands':
        return ['node-typescript']
      case 'dependencies':
        return ['node-typescript', 'shared-contracts']
      case 'security':
      case 'secrets':
      case 'boundaries':
        return ['angular', 'dotnet', 'shared-contracts', 'infrastructure']
      case 'routes':
      case 'components':
      case 'state':
      case 'api-client':
        return ['angular', 'react', 'next']
      case 'api':
      case 'middleware':
      case 'validation':
      case 'errors':
        return ['dotnet', 'next', 'node-typescript']
      case 'database':
      case 'schema':
      case 'migrations':
      case 'queries':
      case 'data-access':
        return ['dotnet', 'shared-contracts']
      case 'jobs':
      case 'queues':
      case 'scheduling':
      case 'retries':
      case 'idempotency':
        return ['workers']
      case 'exports':
      case 'schemas':
      case 'versioning':
      case 'compatibility':
      case 'public-api':
      case 'usage':
        return ['shared-contracts', 'node-typescript']
      case 'deployments':
      case 'environments':
      case 'ci-cd':
      case 'permissions':
        return ['infrastructure']
      default:
        return []
    }
  }
  const operationalSummaries = (
    name: string,
    kinds: readonly string[],
  ): readonly string[] => {
    const domains = operationalDomainsFor(name)
    return operationalFacts
      .filter((fact) => {
        const operationalKind = fact.data.operationalKind
        const domain = fact.data.domain
        if (typeof operationalKind !== 'string' || !kinds.includes(operationalKind)) return false
        if (!domains) return true
        return typeof domain === 'string' && domains.includes(domain)
      })
      .map((fact) => fact.data.summary)
      .filter((summary): summary is string => typeof summary === 'string' && summary.trim().length > 0)
      .map((summary) => summary.trim())
      .filter((summary, index, all) => all.indexOf(summary) === index)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 8)
  }
  const relationships = graph.relationships.map((rel) => `${rel.from} ${rel.type} ${rel.to}`).slice(0, 12)
  const relevantFiles = [...uniq([...routes, ...apiFiles, ...databaseFiles, ...operationFiles, ...dataFiles])]
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 12)
  const safeCommands = [
    ...packageManagers.map((pm) => `${pm} install`),
    ...(scripts.includes('dev') ? [`${packageManagers[0] ?? 'npm'} run dev`] : []),
    ...(scripts.includes('build') ? [`${packageManagers[0] ?? 'npm'} run build`] : []),
    ...(scripts.includes('test') ? [`${packageManagers[0] ?? 'npm'} run test`] : []),
    ...(scripts.includes('typecheck') ? [`${packageManagers[0] ?? 'npm'} run typecheck`] : []),
    ...(scripts.includes('lint') ? [`${packageManagers[0] ?? 'npm'} run lint`] : []),
  ].slice(0, 10)
  const responsibilityFor = (name: string): readonly string[] => {
    switch (name) {
      case 'overview':
        return [`Orient agents to the ${scope}.`, 'Summarize when this context should be loaded.']
      case 'architecture':
        return ['Explain repo structure, packages, apps, and operational boundaries.']
      case 'commands':
      case 'global-commands':
        return ['List safe local commands and validation workflows.']
      case 'dependencies':
        return ['Show internal and external dependency direction before cross-system changes.']
      case 'security':
      case 'secrets':
        return ['Preserve auth, secret-handling, validation, and data-exposure boundaries.']
      case 'boundaries':
        return ['Define what this scope owns and when related context must be loaded.']
      case 'testing':
        return ['Help agents choose the smallest relevant validation path.']
      default:
        return [`Provide operational context for ${titleFor(name).toLowerCase()} work.`]
    }
  }
  const invariantFor = (name: string): readonly string[] => {
    const base = ['Keep generated context deterministic, scoped, and secret-safe.']
    switch (name) {
      case 'security':
      case 'secrets':
        return ['Secret values are never emitted.', 'Environment variables appear as names only.', 'Do not weaken authentication, authorization, or validation boundaries.']
      case 'boundaries':
        return ['Load related context before changing shared contracts, imports, APIs, schemas, or deployment behavior.']
      case 'dependencies':
        return ['Keep dependency direction aligned with existing graph edges.']
      case 'commands':
      case 'global-commands':
        return ['Run targeted validation before broad workspace validation.', 'Avoid destructive commands unless explicitly requested.']
      default:
        return base
    }
  }
  const failureModesFor = (name: string): readonly string[] => {
    switch (name) {
      case 'api':
      case 'api-client':
      case 'validation':
      case 'errors':
        return ['Request or response contract changes can break consumers when handlers, schemas, and tests are not updated together.']
      case 'database':
      case 'schema':
      case 'migrations':
      case 'queries':
      case 'data-access':
        return ['Schema and query changes can break runtime behavior when migrations, callers, and tests drift.']
      case 'security':
      case 'secrets':
      case 'permissions':
        return ['Auth, permission, or secret-handling changes can expose internal data if public-safe boundaries are bypassed.']
      case 'deployments':
      case 'environments':
      case 'ci-cd':
      case 'operations':
        return ['Deployment and CI changes can affect environments outside the edited files.']
      case 'routes':
      case 'components':
      case 'state':
        return ['Frontend route, state, or data-loading changes can drift from API contracts and tests.']
      default:
        return ['Low-evidence changes can become unsafe when agents infer missing architecture from one context file alone.']
    }
  }
  const usefulFor = (name: string): readonly string[] => {
    switch (name) {
      case 'overview':
        return ['first-pass orientation', 'task scoping', 'choosing deeper context files']
      case 'commands':
      case 'global-commands':
        return ['local validation', 'CI preparation', 'safe command selection']
      case 'security':
      case 'secrets':
        return ['auth changes', 'secret-safety review', 'public-safe output checks']
      case 'boundaries':
        return ['ownership checks', 'cross-context changes', 'impact analysis']
      default:
        return [`${titleFor(name).toLowerCase()} changes`, 'review preparation', 'agent task planning']
    }
  }
  const unsafeChangesFor = (name: string): readonly string[] => {
    switch (name) {
      case 'security':
      case 'secrets':
        return ['Do not copy secret values into generated context or public outputs.']
      case 'database':
      case 'migrations':
      case 'schema':
        return ['Do not make destructive data changes without explicit migration and rollback intent.']
      case 'deployments':
      case 'environments':
      case 'ci-cd':
        return ['Do not change deployment behavior without checking environment scope and rollout impact.']
      default:
        return ['Do not infer missing architecture from this file alone. Load related context before broad edits.']
    }
  }

  return [
    bulletSection('Responsibilities', [
      ...responsibilityFor(definition.name),
      ...operationalSummaries(definition.name, ['responsibility', 'runtime-boundary', 'execution-path']),
    ]),
    bulletSection('Dependencies', [
      ...(relationships.length ? relationships : dependencies.map((dep) => `external package: ${dep}`)),
      ...operationalSummaries(definition.name, ['dependency']),
    ]),
    bulletSection('Critical Invariants', [
      ...invariantFor(definition.name),
      ...operationalSummaries(definition.name, ['invariant', 'security-boundary']),
    ]),
    bulletSection('Failure Modes', [
      ...failureModesFor(definition.name),
      ...operationalSummaries(definition.name, ['failure-mode', 'risk']),
    ]),
    bulletSection('Safe Commands', [
      ...safeCommands,
      ...operationalSummaries(definition.name, ['safe-command']),
    ]),
    bulletSection('Useful For', [
      ...usefulFor(definition.name),
      ...operationalSummaries(definition.name, ['task-affordance']),
    ]),
    bulletSection('Unsafe Changes', unsafeChangesFor(definition.name)),
    bulletSection('Evidence', relevantFiles.length
      ? relevantFiles
      : [...uniq(graph.facts.map((fact) => fact.source).filter((source) => source.trim()))]
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 12)),
  ].join('\n')

}

export const renderContextFiles = (
  graph: CtxGraph,
  config: AgentCtxConfig,
  definitions: readonly ContextFileDefinition[] = selectContextFiles({ graph, config }),
): readonly RenderedContextFile[] => {
  const capabilities = detectContextFileCapabilities(graph, config)
  return definitions.map((item) => {
    const title = titleFor(item.name)
    const body = renderBody(item, graph, config, capabilities)
    const content = [`# ${title}`, '', body.trimEnd(), ''].join('\n')
    return {
      name: item.name,
      title,
      category: item.category,
      path: `.agentctx/context/${item.name}.md`,
      content,
      tokenEstimate: estimateTokens(content),
      publicSafe: item.publicSafe,
      definition: item,
      reason: item.requiredCapabilities.length
        ? `required capabilities: ${item.requiredCapabilities.join(', ')}`
        : item.category === 'core'
          ? 'universal context file'
          : 'workspace context file',
    }
  })
}
