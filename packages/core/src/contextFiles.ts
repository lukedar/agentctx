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
  const scopeType = config.scope?.kind === 'point' ? config.scope.type : undefined

  const frontendFrameworks = ['react', 'next', 'angular', 'vue', 'svelte', 'sveltekit', 'solid', 'nuxt', 'astro', 'remix', 'vite']
  const apiFrameworks = ['express', 'fastify', 'nestjs', 'hono', 'aspnetcore', 'fastapi', 'django', 'flask', 'rails', 'laravel']

  const out: ContextFileCapability[] = []
  const add = (capability: ContextFileCapability, detected: boolean) => {
    if (detected) out.push(capability)
  }

  add('frontend', frontendFrameworks.some((name) => frameworks.has(name)) || scopeType === 'frontend')
  add('routing', hasFact(facts, 'route'))
  add('components', hasPath(facts, (source) => /(^|\/)(components|pages|app|src)\//.test(source)))
  add('state', dependencyNames.some((name) => ['redux', '@reduxjs/toolkit', 'zustand', 'pinia', 'vuex', '@ngrx/store', 'jotai', 'recoil'].includes(name)) || hasPath(facts, (source) => /(^|\/)(store|state)\//.test(source)))
  add('api', hasFact(facts, 'api') || apiFrameworks.some((name) => frameworks.has(name)) || scopeType === 'backend')
  add('auth', hasFact(facts, 'auth') || hasPath(facts, (source) => source.toLowerCase().includes('auth')))
  add('database', hasFact(facts, 'database'))
  add('worker', scopeType === 'worker' || hasPath(facts, (source) => /(worker|job|cron|schedule|queue)/i.test(source)))
  add('queue', hasPath(facts, (source) => /(queue|bull|sqs|rabbit|kafka)/i.test(source)))
  add('shared-package', scopeType === 'package' || packageNames.length > 0)
  add('schemas', hasFact(facts, 'data') || hasPath(facts, (source) => /(schema|contract|openapi|proto)/i.test(source)))
  add('infrastructure', scopeType === 'infra' || hasFact(facts, 'operations') || hasPath(facts, (source) => /(^|\/)(infra|infrastructure|ops|k8s|helm|charts|\.github\/workflows)\//.test(source)))
  add('deployment', hasFact(facts, 'operations') || hasPath(facts, (source) => /(Dockerfile|docker-compose|deploy|terraform|pulumi|kubernetes|helm)/i.test(source)))
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

  switch (definition.name) {
    case 'overview':
      return [
        section('Purpose', [`- Summarize the ${scope} and when an agent should load it.`]),
        section('Responsibilities', ['- Owns the files and workflows detected within this context point.']),
        section('Non-Responsibilities', ['- Avoid changes outside this context point unless a related context file says to load them.']),
        section('Primary Technologies', [`- Languages: ${listOrNone(languages)}`, `- Frameworks: ${listOrNone(frameworks)}`, `- Package managers: ${listOrNone(packageManagers)}`]),
        section('Related Context Points', graph.relationships.map((rel) => `- ${rel.from} ${rel.type} ${rel.to}`).slice(0, 8)),
      ].join('\n')
    case 'architecture':
      return [
        section('High-Level Structure', [`- Scope: ${scope}`]),
        section('Main Modules', [...graph.apps.map((app) => `- App: ${app.name ?? app.id} (${app.path})`), ...graph.packages.map((pkg) => `- Package: ${pkg.name ?? pkg.id} (${pkg.path})`)].slice(0, 12)),
        section('Data Flow', graph.relationships.map((rel) => `- ${rel.from} ${rel.type} ${rel.to}`).slice(0, 10)),
        section('Key Design Decisions', ['- Prefer metadata scanning and deterministic generated output.']),
        section('Known Constraints', ['- Generated context should stay compact and avoid source dumps.']),
      ].join('\n')
    case 'conventions':
      return [
        section('Naming', ['- Follow existing package and file naming in the context point.']),
        section('Folder Structure', factsByPath(graph.facts, 'convention', 'path').map((file) => `- ${file}`)),
        section('Code Style', factIndex.strings('convention', 'tool').map((tool) => `- ${tool}`)),
        section('Error Handling', ['- Match existing local error patterns.']),
        section('Logging', ['- Match existing local logging patterns.']),
        section('Anti-Patterns', ['- Avoid broad refactors unrelated to the task.']),
      ].join('\n')
    case 'commands':
    case 'global-commands':
      return [
        section('Install', packageManagers.map((pm) => `- ${pm} install`)),
        section('Development', scripts.includes('dev') ? ['- Use the local dev script from package.json.'] : []),
        section('Build', scripts.includes('build') ? ['- Run the build script for the smallest relevant scope.'] : []),
        section('Test', scripts.includes('test') ? ['- Run targeted tests first, then broader tests if shared behavior changed.'] : []),
        section('Lint', scripts.includes('lint') ? ['- Run lint before finalizing style-sensitive changes.'] : []),
        section('Typecheck', scripts.includes('typecheck') ? ['- Run typecheck for TypeScript changes.'] : []),
        section('Safe Targeted Commands', scripts.map((name) => `- package script: ${name}`).slice(0, 12)),
        section('Commands To Avoid', ['- Do not run destructive data, reset, deployment, or secret-rotation commands unless explicitly requested.']),
      ].join('\n')
    case 'dependencies':
      return [
        section('Internal Dependencies', graph.relationships.filter((rel) => rel.type === 'depends-on').map((rel) => `- ${rel.from} -> ${rel.to}`).slice(0, 12)),
        section('External Dependencies', dependencies.map((dep) => `- ${dep}`)),
        section('Runtime Dependencies', dependencies.map((dep) => `- ${dep}`)),
        section('Development Dependencies', factIndex.strings('convention', 'tool').map((tool) => `- ${tool}`)),
        section('Dependency Boundaries', ['- Keep imports aligned with existing dependency direction.']),
        section('Risky Dependencies', ['- Review generated, auth, database, and deployment dependencies before changing contracts.']),
      ].join('\n')
    case 'testing':
      return [
        section('Test Frameworks', testRunners.map((runner) => `- ${runner}`)),
        section('Test Locations', factsByPath(graph.facts, 'test-runner', 'path').map((file) => `- ${file}`)),
        section('Test Naming', ['- Follow existing `.test` or `.spec` naming where present.']),
        section('How To Run Targeted Tests', ['- Prefer the smallest relevant package or file-level test command before full workspace tests.']),
        section('Mocking Rules', ['- Match existing test doubles and fixtures.']),
        section('Coverage Expectations', ['- Cover changed public behavior and high-risk edge cases.']),
        section('Common Test Failures', ['- Type mismatches, stale generated output, and broad workspace assumptions.']),
      ].join('\n')
    case 'security':
    case 'secrets':
      return [
        section('Authentication', factIndex.strings('auth', 'name').map((name) => `- ${name}`)),
        section('Authorization', ['- Preserve existing authorization boundaries.']),
        section('Secret Handling', factIndex.strings('env-var', 'name').map((name) => `- ${name}`)),
        section('Sensitive Files', ['- `.env*`, private keys, certificates, production credentials, and generated secret material are excluded or redacted.']),
        section('Input Validation', ['- Validate external input at API, job, and data boundaries.']),
        section('Data Exposure Risks', ['- Do not copy secret values into generated context or public outputs.']),
        section('Security Anti-Patterns', ['- Do not log secrets, bypass auth checks, or weaken validation to satisfy tests.']),
      ].join('\n')
    case 'boundaries':
      return [
        section('Owns', [`- ${scope}`]),
        section('Does Not Own', ['- Unrelated context points, generated dependencies, and production infrastructure unless explicitly configured.']),
        section('Allowed Changes', ['- Local changes that preserve detected contracts and dependency direction.']),
        section('Restricted Changes', ['- Cross-context rewrites, public API changes, data migrations, and auth/security changes require extra review.']),
        section('Cross-Context Dependencies', graph.relationships.map((rel) => `- ${rel.from} ${rel.type} ${rel.to}`).slice(0, 12)),
        section('When To Load Related Context', ['- Load related context before changing shared contracts, imports, APIs, database schemas, or deployment behavior.']),
      ].join('\n')
    case 'workspace':
      return [
        section('Repository Purpose', [`- Workspace-level context for ${config.workspace?.name ?? 'this repository'}.`]),
        section('Repository Structure', [...graph.apps.map((app) => `- ${app.path}`), ...graph.packages.map((pkg) => `- ${pkg.path}`)].slice(0, 12)),
        section('Context Points', config.ctxPoints.map((point) => `- ${point.name}: ${point.path}`)),
        section('Primary Workflows', scripts.map((script) => `- ${script}`)),
        section('Global Constraints', ['- Keep generated context deterministic and secret-safe.']),
      ].join('\n')
    case 'mesh':
      return [
        section('System Graph', graph.relationships.map((rel) => `- ${rel.from} ${rel.type} ${rel.to}`).slice(0, 12)),
        section('Dependency Direction', ['- Follow detected dependency direction and existing import edges.']),
        section('Runtime Communication', apiFiles.map((file) => `- ${file}`)),
        section('Shared Contracts', dataFiles.map((file) => `- ${file}`)),
        section('Cross-System Change Rules', ['- Update producers, consumers, tests, and docs together for contract changes.']),
      ].join('\n')
    default:
      return [
        section('Detected Capabilities', capabilities.map((capability) => `- ${capability}`)),
        section('Relevant Files', [...routes, ...apiFiles, ...databaseFiles, ...operationFiles, ...dataFiles].slice(0, 12).map((file) => `- ${file}`)),
        section('Rules', [`- This file is generated because ${definition.requiredCapabilities.length ? definition.requiredCapabilities.join(', ') : 'it is part of the base context set'}.`]),
        section('Anti-Patterns', ['- Do not infer missing architecture from this file alone. Load the related context files listed in AGENTS.md.']),
      ].join('\n')
  }
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
