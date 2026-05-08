import type {
  AgentCtxConfig,
  ContextBlockModel,
  ContextBlockName,
  ContextGraph,
  ContextSection,
  ContextSectionModel,
  Fact,
  RenderedContextBlock,
  RenderedSection,
  TokenBudgetName,
} from './types'

export const estimateTokens = (text: string): number => Math.ceil(text.length / 4)

const uniq = (items: readonly string[]): readonly string[] => {
  const out: string[] = []
  const seen = new Set<string>()
  for (const i of items) {
    if (seen.has(i)) continue
    seen.add(i)
    out.push(i)
  }
  return out
}

const limitList = (items: readonly string[], max = 5): string =>
  items.length <= max ? items.join(', ') : `${items.slice(0, max).join(', ')}, …`

const uniqueStrings = (items: readonly string[]): readonly string[] => [...uniq(items)].sort((a, b) => a.localeCompare(b))

const getFactStrings = (facts: readonly Fact[], kind: Fact['kind'], key: string): readonly string[] => {
  const values: string[] = []
  for (const f of facts) {
    if (f.kind !== kind) continue
    const v = f.data[key]
    if (typeof v === 'string' && v.trim()) values.push(v.trim())
  }

  return [...uniq(values)].sort((a: string, b: string) => a.localeCompare(b))
}

const contextBlockToTitle = (name: ContextBlockName): string => {
  switch (name) {
    case 'architecture':
      return 'Architecture'
    case 'conventions':
      return 'Conventions'
    case 'api':
      return 'API'
    case 'database':
      return 'Database'
    case 'frontend':
      return 'Frontend'
    case 'testing':
      return 'Testing'
    case 'workflows':
      return 'Workflows'
    case 'glossary':
      return 'Glossary'
    default:
      return name
  }
}

const model = (partial: Partial<ContextBlockModel>): ContextBlockModel => ({
  summary: partial.summary ?? [],
  rules: partial.rules ?? [],
  workflows: partial.workflows ?? [],
  files: partial.files ?? [],
  warnings: partial.warnings ?? [],
})

export const planContextBlocks = (graph: ContextGraph, config: AgentCtxConfig): readonly RenderedContextBlock[] => {
  const enabled = (name: ContextBlockName) => Boolean(config.context[name])
  const scope = config.scope
  const scopeFrameworks = scope?.kind === 'point' ? [...(scope.frameworks ?? [])].sort((a, b) => a.localeCompare(b)) : []

  const packageManagers = getFactStrings(graph.facts, 'package-manager', 'name')
  const frameworks = [...uniq([...getFactStrings(graph.facts, 'framework', 'name'), ...scopeFrameworks])]
    .sort((a, b) => a.localeCompare(b))
  const languages = getFactStrings(graph.facts, 'language', 'name')
  const testRunners = getFactStrings(graph.facts, 'test-runner', 'name')
  const envVars = getFactStrings(graph.facts, 'env-var', 'name')
  const scripts = getFactStrings(graph.facts, 'script', 'name')
  const conventionTools = getFactStrings(graph.facts, 'convention', 'tool')
  const apiKinds = getFactStrings(graph.facts, 'api', 'name')
  const dbKinds = getFactStrings(graph.facts, 'database', 'name')
  const routeKinds = getFactStrings(graph.facts, 'route', 'kind')

  const getPathsFor = (kind: Fact['kind'], key: string, filter?: (f: Fact) => boolean): readonly string[] => {
    const out: string[] = []
    for (const f of graph.facts) {
      if (f.kind !== kind) continue
      if (filter && !filter(f)) continue
      const v = f.data[key]
      if (typeof v === 'string' && v.trim()) out.push(v.trim())
    }
    return [...uniq(out)].sort((a, b) => a.localeCompare(b))
  }

  const configFiles = getPathsFor('convention', 'path')
  const configFilesForTool = (tool: string): readonly string[] =>
    getPathsFor('convention', 'path', (f) => f.data.tool === tool)

  const apiFiles = getPathsFor('api', 'path')
  const dbFiles = getPathsFor('database', 'path')
  const routeFiles = getPathsFor('route', 'file')
  const routePaths = getPathsFor('route', 'path')

  const models: Partial<Record<ContextBlockName, ContextBlockModel>> = {}

  if (enabled('architecture')) {
    const wsName = config.workspace?.name
    const manifestFiles = uniqueStrings(
      graph.facts
        .filter((f) => f.kind === 'package' && typeof f.source === 'string' && f.source.trim())
        .map((f) => f.source.trim())
        .filter((source) => source !== 'package.json')
        .filter((source) => (
          scope?.kind === 'point'
            ? source === `${scope.path}/package.json` || source.startsWith(`${scope.path}/`)
            : true
        )),
    )
    const appLabels = graph.apps
      .map((app) => app.name ? `${app.name} (${app.path})` : app.path)
      .sort((a, b) => a.localeCompare(b))
    const packageLabels = graph.packages
      .map((pkg) => pkg.name ? `${pkg.name} (${pkg.path})` : pkg.path)
      .sort((a, b) => a.localeCompare(b))
    const dependencyLabels = graph.relationships
      .filter((relationship) => relationship.type === 'depends-on')
      .map((relationship) => `${relationship.from} -> ${relationship.to}`)
      .sort((a, b) => a.localeCompare(b))

    models.architecture = model({
      summary: [
        ...(scope?.kind === 'point'
          ? [
              `Context scope: point \`${scope.name}\` at \`${scope.path}\``,
              ...(scope.type ? [`Point type: ${scope.type}`] : []),
              ...(scope.dependsOn?.length ? [`Point depends on: ${scope.dependsOn.join(', ')}`] : []),
            ]
          : ['Context scope: workspace']),
        ...(wsName ? [`Workspace name: ${wsName}`] : []),
        packageManagers.length ? `Package manager: ${packageManagers.join(', ')}` : 'Package manager: (unknown)',
        languages.length ? `Languages: ${languages.join(', ')}` : 'Languages: (unknown)',
        frameworks.length ? `Frameworks: ${frameworks.join(', ')}` : 'Frameworks: (none detected)',
        graph.facts.some((f) => f.kind === 'workspace') ? 'Workspace: detected' : 'Workspace: not detected',
        appLabels.length ? `Apps in scope: ${limitList(appLabels)}` : 'Apps in scope: (none detected)',
        packageLabels.length ? `Packages in scope: ${limitList(packageLabels)}` : 'Packages in scope: (none detected)',
        dependencyLabels.length
          ? `Internal dependencies: ${limitList(dependencyLabels)}`
          : 'Internal dependencies: (none detected)',
      ],
      files: [
        { path: 'agentctx.config.ts', reason: 'AgentCtx configuration' },
        { path: 'package.json', reason: 'Project manifest and scripts' },
        ...(configFiles.includes('.editorconfig') ? [{ path: '.editorconfig', reason: 'Code style basics' }] : []),
        ...manifestFiles.slice(0, 8).map((source) => ({
          path: source,
          reason: 'Package/app manifest in scope',
        })),
      ],
    })
  }

  if (enabled('conventions')) {
    const pm = packageManagers[0] ?? config.workspace?.packageManager ?? 'npm'

    const has = (name: string): boolean => scripts.includes(name)

    const rules: string[] = [
      'Keep generated outputs deterministic (stable ordering; no timestamps).',
      'Do not include secret values in generated context.',
      'Prefer metadata/config scanning over dumping full source files.',
      'Make minimal, reviewable diffs; avoid sweeping refactors unless explicitly requested.',
    ]

    if (conventionTools.includes('eslint')) rules.push(`Follow ESLint rules; run \`${pm} run lint\` when changing TS/JS.`)
    if (conventionTools.includes('prettier')) rules.push('Do not hand-format; rely on Prettier configuration where present.')
    if (conventionTools.includes('typescript')) rules.push('Prefer strict typing; avoid `any` unless unavoidable and justified.')

    if (frameworks.includes('angular') || conventionTools.includes('angular-cli')) {
      rules.push('For Angular work, follow `angular.json` defaults and existing app patterns (components, routes, DI).')
      rules.push('Prefer updating/adding tests alongside behavioral changes (unit + e2e where applicable).')
    }

    if (has('format') || has('fmt')) rules.push(`Use the repo formatter: \`${pm} run ${has('format') ? 'format' : 'fmt'}\`.`)
    if (has('typecheck')) rules.push(`Run typecheck for TS changes: \`${pm} run typecheck\`.`)

    const files = configFiles
      .slice(0, 12)
      .map((p) => {
        const tool = graph.facts.find((f) => f.kind === 'convention' && f.data.path === p)?.data.tool
        const t = typeof tool === 'string' && tool.trim() ? tool.trim() : 'tooling'
        return { path: p, reason: `Project convention/config (${t})` }
      })

    models.conventions = model({
      summary: [
        conventionTools.length ? `Tooling detected: ${conventionTools.join(', ')}` : 'Tooling detected: (none)',
        scripts.length ? `Common scripts: ${['dev', 'start', 'build', 'test', 'lint', 'typecheck', 'format'].filter((s) => scripts.includes(s)).join(', ') || '(other)'} ` : 'Common scripts: (none detected)',
      ],
      rules,
      files,
    })
  }

  if (enabled('testing')) {
    const pm = packageManagers[0] ?? config.workspace?.packageManager ?? 'npm'

    const testConfigTools = ['playwright', 'cypress', 'vitest', 'jest', 'karma']
      .filter((t) => conventionTools.includes(t))
      .join(', ')

    models.testing = model({
      summary: [
        testRunners.length ? `Detected test runners (deps): ${testRunners.join(', ')}` : 'Detected test runners (deps): (none)',
        testConfigTools ? `Test config files detected: ${testConfigTools}` : 'Test config files detected: (none)',
      ],
      rules: [
        'Run the smallest relevant test suite before finalizing changes.',
        ...(scripts.includes('test') ? [`Preferred: \`${pm} run test\``] : []),
        ...(scripts.includes('e2e') ? [`E2E: \`${pm} run e2e\``] : []),
      ],
      files: [
        ...configFilesForTool('playwright').slice(0, 5).map((p) => ({ path: p, reason: 'Playwright config' })),
        ...configFilesForTool('cypress').slice(0, 5).map((p) => ({ path: p, reason: 'Cypress config' })),
        ...configFilesForTool('vitest').slice(0, 5).map((p) => ({ path: p, reason: 'Vitest config' })),
        ...configFilesForTool('jest').slice(0, 5).map((p) => ({ path: p, reason: 'Jest config' })),
      ],
    })
  }

  if (enabled('workflows')) {
    const pm = packageManagers[0] ?? config.workspace?.packageManager ?? 'npm'

    const runScript = (name: string): string => (pm === 'yarn' ? `yarn ${name}` : `${pm} run ${name}`)

    const workflows: string[] = [`Install: \`${pm} install\``]

    if (scripts.includes('dev')) workflows.push(`Dev: \`${runScript('dev')}\``)
    else if (scripts.includes('start')) workflows.push(`Start: \`${runScript('start')}\``)

    if (scripts.includes('typecheck')) workflows.push(`Typecheck: \`${runScript('typecheck')}\``)
    if (scripts.includes('lint')) workflows.push(`Lint: \`${runScript('lint')}\``)
    if (scripts.includes('test')) workflows.push(`Test: \`${runScript('test')}\``)
    if (scripts.includes('e2e')) workflows.push(`E2E: \`${runScript('e2e')}\``)
    if (scripts.includes('build')) workflows.push(`Build: \`${runScript('build')}\``)

    if (!scripts.includes('build') && pm === 'pnpm') workflows.push('Build (fallback): `pnpm -r build`')
    if (!scripts.includes('test') && pm === 'pnpm') workflows.push('Test (fallback): `pnpm -r test`')

    workflows.push('Update context: `agentctx build && agentctx sync`')

    models.workflows = model({ workflows })
  }

  if (enabled('api')) {
    const backendFrameworks = frameworks.filter((f) => ['express', 'fastify', 'nestjs', 'hono', 'next', 'sveltekit', 'nuxt', 'astro', 'remix'].includes(f))
    models.api = model({
      summary: [
        backendFrameworks.length ? `API-related frameworks detected: ${backendFrameworks.join(', ')}` : 'API-related frameworks detected: (none)',
        apiKinds.length ? `API artifacts detected: ${apiKinds.join(', ')}` : 'API artifacts detected: (none)',
        routePaths.length ? `Route paths detected: ${routePaths.slice(0, 6).join(', ')}${routePaths.length > 6 ? ', …' : ''}` : 'Route paths detected: (none)',
        routeKinds.length ? `Route conventions detected: ${routeKinds.join(', ')}` : 'Route conventions detected: (none)',
        apiFiles.length ? `Spec files: ${apiFiles.slice(0, 5).join(', ')}${apiFiles.length > 5 ? ', …' : ''}` : 'Spec files: (none)',
      ],
      rules: apiFiles.length || routeFiles.length
        ? [
            'Prefer updating API specs alongside endpoint changes when spec files exist.',
            'Keep route contracts and handlers aligned when changing endpoint behavior.',
          ]
        : ['No API specs or route files were found in the scanned scope; rely on source code and existing backend docs.'],
      files: [
        ...apiFiles.slice(0, 6).map((p) => ({ path: p, reason: 'API spec/artifact' })),
        ...routeFiles.slice(0, 6).map((p) => ({ path: p, reason: 'Route handler/module' })),
      ],
    })
  }

  if (enabled('database')) {
    models.database = model({
      summary: [
        dbKinds.length ? `Database artifacts detected: ${dbKinds.join(', ')}` : 'Database artifacts detected: (none)',
        dbFiles.length ? `Spec/migration files: ${dbFiles.slice(0, 5).join(', ')}${dbFiles.length > 5 ? ', …' : ''}` : 'Spec/migration files: (none)',
      ],
      rules: dbFiles.length
        ? ['When changing schemas/migrations, keep changes incremental and reversible.', 'Avoid destructive migration defaults unless explicitly requested.']
        : ['No DB schema/migration artifacts were found in the scanned scope.'],
      files: dbFiles.slice(0, 10).map((p) => ({ path: p, reason: 'DB schema/migration artifact' })),
    })
  }

  if (enabled('frontend')) {
    const frontend = frameworks.filter((f) => ['react', 'next', 'angular', 'vite', 'sveltekit', 'nuxt', 'astro', 'remix'].includes(f))
    const frontendScopes = [...graph.apps, ...graph.packages]
      .filter((node) => node.path === 'apps' || node.path.startsWith('apps/') || node.path === 'packages' || node.path.startsWith('packages/'))
      .map((node) => node.name ? `${node.name} (${node.path})` : node.path)
      .sort((a, b) => a.localeCompare(b))

    models.frontend = model({
      summary: [
        frameworks.length
          ? `Frontend-related frameworks detected: ${frontend.join(', ') || '(none)'}`
          : '(MVP) No frontend framework detected',
        ...(routePaths.length ? [`Frontend/API route files detected: ${routePaths.slice(0, 5).join(', ')}${routePaths.length > 5 ? ', …' : ''}`] : []),
        ...(scope?.kind === 'point' && scope.frameworks?.length
          ? [`Configured point frameworks: ${scope.frameworks.join(', ')}`]
          : []),
        frontendScopes.length
          ? `Frontend-relevant scope entries: ${limitList(frontendScopes)}`
          : 'Frontend-relevant scope entries: (none detected)',
      ],
    })
  }

  if (enabled('glossary')) {
    models.glossary = model({
      summary: envVars.length ? ['Environment variable names referenced in the repo:'] : [],
      rules: envVars,
    })
  }

  const contextBlocks = Object.entries(models)
    .map(([name, model]) => ({ name: name as ContextBlockName, model: model as ContextBlockModel }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const rendered = contextBlocks.map(({ name, model }) => renderContextBlock(name, model))

  return fitContextBlocksToBudget(rendered, config.budgets.default, config)
}

export const planSections = (graph: ContextGraph, config: AgentCtxConfig): readonly RenderedSection[] =>
  planContextBlocks(graph, config)

export const renderContextBlock = (
  name: ContextBlockName,
  model: ContextBlockModel,
): RenderedContextBlock => {
  const title = contextBlockToTitle(name)

  const lines: string[] = [`# ${title}`, '']

  if (model.summary.length) {
    lines.push('## Summary', '', ...model.summary.map((s) => `- ${s}`), '')
  }

  if (model.rules.length) {
    lines.push('## Rules', '', ...model.rules.map((s) => (s.startsWith('- ') ? s : `- ${s}`)), '')
  }

  if (model.workflows.length) {
    lines.push('## Workflows', '', ...model.workflows.map((s) => `- ${s}`), '')
  }

  if (model.files.length) {
    lines.push('## Important files', '')
    for (const f of model.files) lines.push(`- \`${f.path}\`: ${f.reason}`)
    lines.push('')
  }

  if (model.warnings.length) {
    lines.push('## Warnings', '', ...model.warnings.map((s) => `- ${s}`), '')
  }

  const content = lines.join('\n').trimEnd() + '\n'

  return {
    name,
    title,
    content,
    tokenEstimate: estimateTokens(content),
  }
}

export const renderSection = (name: ContextSection, model: ContextSectionModel): RenderedSection =>
  renderContextBlock(name, model)

const budgetToMaxTokens = (budget: TokenBudgetName, config: AgentCtxConfig): number => {
  switch (budget) {
    case 'small':
      return config.budgets.small
    case 'medium':
      return config.budgets.medium
    case 'large':
      return config.budgets.large
    default:
      return config.budgets.large
  }
}

const trimToTokenBudget = (text: string, maxTokens: number): string => {
  if (estimateTokens(text) <= maxTokens) return text

  const lines = text.split(/\r?\n/)
  const out: string[] = []
  let used = 0

  for (const line of lines) {
    const next = out.length ? `${out.join('\n')}\n${line}\n` : `${line}\n`
    const tokens = estimateTokens(next)
    if (tokens > maxTokens) break

    out.push(line)
    used = tokens
  }

  // Ensure it ends with a newline and mark truncation.
  const base = out.join('\n').trimEnd() + '\n'
  const suffix = '\n_(truncated)_\n'
  const candidate = base + suffix

  return estimateTokens(candidate) <= maxTokens ? candidate : base
}

export const fitContextBlocksToBudget = (
  contextBlocks: readonly RenderedContextBlock[],
  budget: TokenBudgetName,
  config: AgentCtxConfig,
): readonly RenderedContextBlock[] => {
  const maxTokens = budgetToMaxTokens(budget, config)

  // Simple deterministic policy: prioritize architecture/conventions/testing/workflows.
  const priority = (name: ContextBlockName): number => {
    switch (name) {
      case 'architecture':
        return 100
      case 'conventions':
        return 90
      case 'testing':
        return 80
      case 'workflows':
        return 70
      default:
        return 50
    }
  }

  const sorted = [...contextBlocks].sort((a, b) => {
    const p = priority(b.name) - priority(a.name)
    return p !== 0 ? p : a.name.localeCompare(b.name)
  })

  const selected: RenderedContextBlock[] = []
  let used = 0

  for (const s of sorted) {
    const cost = estimateTokens(s.content)
    if (used + cost <= maxTokens) {
      selected.push(s)
      used += cost
      continue
    }

    // Try trimming this context block to fit the remaining budget.
    const remaining = Math.max(0, maxTokens - used)
    const trimmed = trimToTokenBudget(s.content, remaining)
    if (estimateTokens(trimmed) > 0 && estimateTokens(trimmed) <= remaining) {
      selected.push({ ...s, content: trimmed, tokenEstimate: estimateTokens(trimmed) })
      used += estimateTokens(trimmed)
    }
  }

  // Return to stable order by context-block name for rendering.
  return selected.sort((a, b) => a.name.localeCompare(b.name))
}

export const fitSectionsToBudget = (
  sections: readonly RenderedSection[],
  budget: TokenBudgetName,
  config: AgentCtxConfig,
): readonly RenderedSection[] => fitContextBlocksToBudget(sections, budget, config)
