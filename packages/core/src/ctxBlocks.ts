import type {
  AgentCtxConfig,
  CtxBlockModel,
  CtxBlockName,
  CtxGraph,
  RenderedCtxBlock,
  TokenBudgetName,
} from './types'
import { createCtxFactIndex } from './ctxBlockFacts'

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
const basename = (filePath: string): string => filePath.split('/').at(-1) ?? filePath

const FRONTEND_FRAMEWORKS: readonly string[] = ['react', 'next', 'angular', 'vite', 'sveltekit', 'nuxt', 'astro', 'remix']
const API_FRAMEWORKS: readonly string[] = ['express', 'fastify', 'nestjs', 'hono', 'next', 'sveltekit', 'nuxt', 'astro', 'remix', 'aspnetcore', 'fastapi', 'django', 'flask']

const filterKnownFrameworks = (frameworks: readonly string[], known: readonly string[]): readonly string[] =>
  frameworks.filter((framework) => known.includes(framework))

const pickPathsByBasename = (paths: readonly string[], names: readonly string[]): readonly string[] => {
  const wanted = new Set(names)
  return paths.filter((filePath) => wanted.has(basename(filePath)))
}

const ctxBlockToTitle = (name: CtxBlockName): string => {
  switch (name) {
    case 'architecture':
      return 'Architecture'
    case 'conventions':
      return 'Conventions'
    case 'runtime':
      return 'Runtime'
    case 'api':
      return 'API'
    case 'database':
      return 'Database'
    case 'operations':
      return 'Operations'
    case 'data':
      return 'Data'
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

const model = (partial: Partial<CtxBlockModel>): CtxBlockModel => ({
  summary: partial.summary ?? [],
  rules: partial.rules ?? [],
  workflows: partial.workflows ?? [],
  files: partial.files ?? [],
  warnings: partial.warnings ?? [],
})

export const planCtxBlocks = (graph: CtxGraph, config: AgentCtxConfig): readonly RenderedCtxBlock[] => {
  const blockConfig = config.ctxBlocks
  const enabled = (name: CtxBlockName) => Boolean(blockConfig[name])
  const scope = config.scope
  const scopeFrameworks = scope?.kind === 'point' ? [...(scope.frameworks ?? [])].sort((a, b) => a.localeCompare(b)) : []
  const factIndex = createCtxFactIndex(graph.facts)

  const packageManagers = factIndex.strings('package-manager', 'name')
  const frameworks = [...uniq([...factIndex.strings('framework', 'name'), ...scopeFrameworks])]
    .sort((a, b) => a.localeCompare(b))
  const languages = factIndex.strings('language', 'name')
  const testRunners = factIndex.strings('test-runner', 'name')
  const envVars = factIndex.strings('env-var', 'name')
  const scripts = factIndex.strings('script', 'name')
  const conventionTools = factIndex.strings('convention', 'tool')
  const runtimes = factIndex.strings('runtime', 'name')
  const apiKinds = factIndex.strings('api', 'name')
  const dbKinds = factIndex.strings('database', 'name')
  const operationsKinds = factIndex.strings('operations', 'name')
  const dataKinds = factIndex.strings('data', 'name')
  const routeKinds = factIndex.strings('route', 'kind')

  const configFiles = factIndex.paths('convention', 'path')
  const configFilesForTool = (tool: string): readonly string[] =>
    factIndex.paths('convention', 'path', (f) => f.data.tool === tool)

  const apiFiles = factIndex.paths('api', 'path')
  const dbFiles = factIndex.paths('database', 'path')
  const operationsFiles = factIndex.paths('operations', 'path')
  const dataFiles = factIndex.paths('data', 'path')
  const routeFiles = factIndex.paths('route', 'file')
  const routePaths = factIndex.paths('route', 'path')
  const runtimeSources = uniqueStrings(
    factIndex.byKind('runtime')
      .filter((fact) => fact.source.trim())
      .map((fact) => fact.source.trim()),
  )
  const frontendConfigFiles = uniqueStrings([
    ...pickPathsByBasename(configFiles, [
      'angular.json',
      'vite.config.ts',
      'vite.config.js',
      'vite.config.mts',
      'vite.config.mjs',
      'next.config.js',
      'next.config.mjs',
      'next.config.ts',
      'nuxt.config.ts',
      'nuxt.config.js',
      'astro.config.mjs',
      'astro.config.ts',
      'svelte.config.js',
      'svelte.config.ts',
      'remix.config.js',
      'remix.config.ts',
    ]),
  ])

  const models: Partial<Record<CtxBlockName, CtxBlockModel>> = {}

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
        const tool = factIndex.byKind('convention').find((f) => f.data.path === p)?.data.tool
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

  if (enabled('runtime') && (runtimes.length || runtimeSources.length)) {
    const rules: string[] = []

    if (runtimes.includes('node')) {
      rules.push('Keep package scripts and runtime entrypoints aligned when changing startup behavior.')
    }
    if (runtimes.includes('dotnet')) {
      rules.push('Keep project files and runtime entrypoints aligned when changing hosting or SDK configuration.')
    }
    if (runtimes.includes('python')) {
      rules.push('Keep project manifests and runtime entrypoints aligned when changing startup or dependency behavior.')
    }
    if (!rules.length) {
      rules.push('Keep runtime manifests and startup files aligned when changing execution behavior.')
    }

    models.runtime = model({
      summary: [
        runtimes.length ? `Runtimes detected: ${runtimes.join(', ')}` : 'Runtimes detected: (none)',
        runtimeSources.length
          ? `Runtime markers: ${limitList(runtimeSources, 6)}`
          : 'Runtime markers: (none detected)',
      ],
      rules,
      files: runtimeSources.slice(0, 8).map((path) => ({
        path,
        reason: 'Runtime manifest or entrypoint',
      })),
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
    const backendFrameworks = filterKnownFrameworks(frameworks, API_FRAMEWORKS)
    if (backendFrameworks.length || apiKinds.length || routePaths.length || routeKinds.length || apiFiles.length || routeFiles.length) {
      const apiShape: string[] = []
      const apiRules: string[] = []

      if (backendFrameworks.some((framework) => ['express', 'fastify', 'hono'].includes(framework))) {
        apiShape.push('Middleware-style request pipeline detected.')
        apiRules.push('Keep middleware, handler registration, and request validation aligned when changing endpoint behavior.')
      }
      if (backendFrameworks.includes('nestjs')) {
        apiShape.push('Nest-style module and controller structure detected.')
        apiRules.push('Keep module, controller, provider, and DTO changes aligned when modifying endpoint behavior.')
      }
      if (backendFrameworks.includes('aspnetcore')) {
        apiShape.push('ASP.NET Core application host detected.')
        apiRules.push('Keep Program.cs, service registration, and mapped routes aligned when changing endpoint behavior.')
      }
      if (backendFrameworks.some((framework) => ['fastapi', 'django', 'flask'].includes(framework))) {
        apiShape.push('Python application or router entrypoint detected.')
        apiRules.push('Keep application factories, routers, and request or schema models aligned when changing endpoint behavior.')
      }
      if (backendFrameworks.some((framework) => ['next', 'sveltekit', 'nuxt', 'astro', 'remix'].includes(framework))) {
        apiShape.push('Framework-managed route modules detected.')
        apiRules.push('Keep route modules, data loaders, and response contracts aligned when changing endpoint behavior.')
      }
      if (apiFiles.length) {
        apiRules.push('Prefer updating API specs alongside endpoint changes when spec files exist.')
      }
      if (routeFiles.length) {
        apiRules.push('Keep route contracts and handlers aligned when changing endpoint behavior.')
      }
      if (!apiRules.length) {
        apiRules.push('Use the detected framework and routing markers to trace request flow before making endpoint changes.')
      }

      models.api = model({
        summary: [
          backendFrameworks.length ? `API-related frameworks detected: ${backendFrameworks.join(', ')}` : 'API-related frameworks detected: (none)',
          ...(apiShape.length ? [`API implementation shape: ${apiShape.join(' ')}`] : []),
          apiKinds.length ? `API artifacts detected: ${apiKinds.join(', ')}` : 'API artifacts detected: (none)',
          routePaths.length ? `Route paths detected: ${routePaths.slice(0, 6).join(', ')}${routePaths.length > 6 ? ', …' : ''}` : 'Route paths detected: (none)',
          routeKinds.length ? `Route conventions detected: ${routeKinds.join(', ')}` : 'Route conventions detected: (none)',
          apiFiles.length ? `Spec files: ${apiFiles.slice(0, 5).join(', ')}${apiFiles.length > 5 ? ', …' : ''}` : 'Spec files: (none)',
        ],
        rules: uniqueStrings(apiRules),
        files: [
          ...apiFiles.slice(0, 6).map((p) => ({ path: p, reason: 'API spec/artifact' })),
          ...runtimeSources
            .filter((path) => path.endsWith('Program.cs') || path.endsWith('server.ts') || path.endsWith('server.js') || path.endsWith('main.py'))
            .slice(0, 4)
            .map((p) => ({ path: p, reason: 'API runtime entrypoint' })),
          ...routeFiles.slice(0, 6).map((p) => ({ path: p, reason: 'Route handler/module' })),
        ],
      })
    }
  }

  if (enabled('database')) {
    if (dbKinds.length || dbFiles.length) {
      models.database = model({
        summary: [
          dbKinds.length ? `Database artifacts detected: ${dbKinds.join(', ')}` : 'Database artifacts detected: (none)',
          dbFiles.length ? `Spec/migration files: ${dbFiles.slice(0, 5).join(', ')}${dbFiles.length > 5 ? ', …' : ''}` : 'Spec/migration files: (none)',
        ],
        rules: [
          'When changing schemas or migrations, keep changes incremental and reversible.',
          'Avoid destructive migration defaults unless explicitly requested.',
        ],
        files: dbFiles.slice(0, 10).map((p) => ({ path: p, reason: 'DB schema/migration artifact' })),
      })
    }
  }

  if (enabled('operations') && (operationsKinds.length || operationsFiles.length || scope?.kind === 'point' && scope.type === 'infra')) {
    const operationsRules: string[] = []
    const operationsShape: string[] = []

    if (operationsKinds.includes('docker')) {
      operationsShape.push('Container packaging or local container orchestration detected.')
      operationsRules.push('Keep image build configuration and runtime assumptions aligned when changing operational behavior.')
    }
    if (operationsKinds.includes('terraform')) {
      operationsShape.push('Infrastructure-as-code definitions detected.')
      operationsRules.push('Keep infrastructure changes incremental, reviewable, and environment-safe.')
    }
    if (operationsKinds.includes('kubernetes') || operationsKinds.includes('helm')) {
      operationsShape.push('Cluster deployment manifests detected.')
      operationsRules.push('Keep workload configuration, manifests, and rollout assumptions aligned when changing deployment behavior.')
    }
    if (operationsKinds.includes('github-actions')) {
      operationsShape.push('Automation workflow definitions detected.')
      operationsRules.push('Keep CI and deployment workflow changes deterministic and scoped to the environments they affect.')
    }
    if (operationsKinds.includes('observability')) {
      operationsShape.push('Observability configuration detected.')
      operationsRules.push('Update dashboards, alerts, or telemetry definitions alongside operational behavior changes when they share the same scope.')
    }
    if (operationsKinds.includes('runbook')) {
      operationsShape.push('Operational runbook material detected.')
      operationsRules.push('Keep runbooks aligned with the actual deployment and recovery behavior of the system.')
    }
    if (!operationsRules.length) {
      operationsRules.push('Keep deployment, automation, and operational configuration aligned when changing system behavior.')
    }

    models.operations = model({
      summary: [
        operationsKinds.length ? `Operational surfaces detected: ${operationsKinds.join(', ')}` : 'Operational surfaces detected: (none)',
        ...(operationsShape.length ? [`Operations implementation shape: ${operationsShape.join(' ')}`] : []),
        operationsFiles.length ? `Operational artifacts: ${limitList(operationsFiles, 6)}` : 'Operational artifacts: (none detected)',
      ],
      rules: uniqueStrings(operationsRules),
      files: operationsFiles.slice(0, 10).map((filePath) => ({
        path: filePath,
        reason: 'Operational artifact',
      })),
    })
  }

  const apiFrameworkPresent = frameworks.some((framework) => API_FRAMEWORKS.includes(framework))
  const dataPythonShape = runtimes.includes('python') && !apiFrameworkPresent && !filterKnownFrameworks(frameworks, FRONTEND_FRAMEWORKS).length

  if (enabled('data') && (dataKinds.length || dataFiles.length || dataPythonShape)) {
    const dataRules: string[] = []
    const dataShape: string[] = []
    const dataPathsFor = (name: string): readonly string[] =>
      factIndex.paths('data', 'path', (f) => f.data.name === name)

    const sourcePaths = dataPathsFor('source')
    const jobPaths = dataPathsFor('job')
    const qualityPaths = dataPathsFor('quality')

    if (dataKinds.includes('source')) {
      dataShape.push('Data source contracts detected.')
      dataRules.push('Keep source definitions, schema contracts, and upstream assumptions aligned when changing ingestion behavior.')
    }
    if (dataKinds.includes('job')) {
      dataShape.push('Scheduled or batch job definitions detected.')
      dataRules.push('Keep job boundaries, dependencies, and runtime assumptions aligned when changing batch or orchestration behavior.')
    }
    if (dataKinds.includes('quality')) {
      dataShape.push('Data quality checks or validation artifacts detected.')
      dataRules.push('Keep validation rules and expected data contracts aligned with the actual pipeline shape.')
    }
    if (dataKinds.includes('notebook')) {
      dataShape.push('Notebook or research workflow detected.')
      dataRules.push('Keep exploratory artifacts and production-facing logic clearly separated when both exist in the same scope.')
    }
    if (dataKinds.includes('dbt')) {
      dataShape.push('Transformation-model project structure detected.')
      dataRules.push('Keep model logic, project configuration, and data assumptions aligned when changing transformation behavior.')
    }
    if (dataKinds.includes('airflow')) {
      dataShape.push('Scheduled pipeline orchestration detected.')
      dataRules.push('Keep DAG changes incremental and preserve task ordering and dependency clarity.')
    }
    if (dataPythonShape) {
      dataShape.push('Python data or analysis-oriented runtime detected.')
      dataRules.push('Preserve reproducibility by keeping dependencies, entrypoints, and data assumptions aligned when changing analysis or batch workflows.')
    }
    if (!dataRules.length) {
      dataRules.push('Keep data pipelines, analysis artifacts, and reproducibility assumptions aligned when changing data-oriented behavior.')
    }

    models.data = model({
      summary: [
        ...(dataPythonShape ? ['Data-oriented Python runtime detected.'] : []),
        dataKinds.length ? `Data surfaces detected: ${dataKinds.join(', ')}` : 'Data surfaces detected: (none)',
        ...(dataShape.length ? [`Data implementation shape: ${dataShape.join(' ')}`] : []),
        dataFiles.length ? `Data artifacts: ${limitList(dataFiles, 6)}` : 'Data artifacts: (none detected)',
      ],
      rules: uniqueStrings(dataRules),
      files: [
        ...sourcePaths.slice(0, 4).map((filePath) => ({
          path: filePath,
          reason: 'Data source or schema contract',
        })),
        ...jobPaths.slice(0, 4).map((filePath) => ({
          path: filePath,
          reason: 'Data job or pipeline definition',
        })),
        ...qualityPaths.slice(0, 4).map((filePath) => ({
          path: filePath,
          reason: 'Data quality or validation artifact',
        })),
        ...dataFiles.slice(0, 10).map((filePath) => ({
          path: filePath,
          reason: 'Data or analysis artifact',
        })),
        ...runtimeSources
          .filter((filePath) => filePath.endsWith('.py'))
          .slice(0, 4)
          .map((filePath) => ({
            path: filePath,
            reason: 'Python runtime entrypoint',
          })),
      ],
    })
  }

  if (enabled('frontend')) {
    const frontend = filterKnownFrameworks(frameworks, FRONTEND_FRAMEWORKS)
    const frontendScopes = [...graph.apps, ...graph.packages]
      .map((node) => node.name ? `${node.name} (${node.path})` : node.path)
      .sort((a, b) => a.localeCompare(b))
    const configuredFrontend = scope?.kind === 'point'
      ? filterKnownFrameworks(scope.frameworks ?? [], FRONTEND_FRAMEWORKS)
      : []

    if (frontend.length || configuredFrontend.length || (scope?.kind === 'point' && scope.type === 'frontend')) {
      const frontendShape: string[] = []
      const frontendRules: string[] = []

      if (frontend.includes('angular')) {
        frontendShape.push('Angular workspace and component structure detected.')
        frontendRules.push('Keep components, templates, styles, and DI wiring aligned when changing Angular features.')
      }
      if (frontend.includes('react')) {
        frontendShape.push('Component-driven React UI detected.')
        frontendRules.push('Keep components, state boundaries, and adjacent route or data-loading code aligned when changing UI behavior.')
      }
      if (frontend.includes('vite')) {
        frontendShape.push('Bundler-led frontend entrypoint detected.')
      }
      if (frontend.some((framework) => ['next', 'nuxt', 'sveltekit', 'astro', 'remix'].includes(framework))) {
        frontendShape.push('Framework-managed routing or app-shell structure detected.')
        frontendRules.push('Keep route modules, page-level data loading, and UI entrypoints aligned when changing frontend behavior.')
      }
      if (frontendConfigFiles.length) {
        frontendRules.push('Treat frontend config files as part of the application contract when changing build or routing behavior.')
      }
      if (!frontendRules.length) {
        frontendRules.push('Keep frontend entrypoints, routing surfaces, and component boundaries aligned when changing UI behavior.')
      }

      models.frontend = model({
        summary: [
          frontend.length
            ? `Frontend-related frameworks detected: ${frontend.join(', ')}`
            : 'Frontend-related frameworks detected: (none)',
          ...(frontendShape.length ? [`Frontend implementation shape: ${frontendShape.join(' ')}`] : []),
          ...(routePaths.length ? [`Frontend/API route files detected: ${routePaths.slice(0, 5).join(', ')}${routePaths.length > 5 ? ', …' : ''}`] : []),
          ...(configuredFrontend.length
            ? [`Configured point frameworks: ${configuredFrontend.join(', ')}`]
            : []),
          frontendScopes.length
            ? `Frontend-relevant scope entries: ${limitList(frontendScopes)}`
            : 'Frontend-relevant scope entries: (none detected)',
        ],
        rules: uniqueStrings(frontendRules),
        files: [
          ...frontendConfigFiles.slice(0, 6).map((p) => ({ path: p, reason: 'Frontend framework or build config' })),
          ...routeFiles
            .filter((path) => path.includes('/app/') || path.includes('/pages/') || path.includes('/routes/'))
            .slice(0, 6)
            .map((p) => ({ path: p, reason: 'Frontend route or app module' })),
        ],
      })
    }
  }

  if (enabled('glossary') && envVars.length) {
    models.glossary = model({
      summary: envVars.length ? ['Environment variable names referenced in the repo:'] : [],
      rules: envVars,
    })
  }

  const ctxBlocks = Object.entries(models)
    .map(([name, model]) => ({ name: name as CtxBlockName, model: model as CtxBlockModel }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const rendered = ctxBlocks.map(({ name, model }) => renderCtxBlock(name, model))

  return fitCtxBlocksToBudget(rendered, config.budgets.default, config)
}

export const renderCtxBlock = (
  name: CtxBlockName,
  model: CtxBlockModel,
): RenderedCtxBlock => {
  const title = ctxBlockToTitle(name)

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

export const fitCtxBlocksToBudget = (
  ctxBlocks: readonly RenderedCtxBlock[],
  budget: TokenBudgetName,
  config: AgentCtxConfig,
): readonly RenderedCtxBlock[] => {
  const maxTokens = budgetToMaxTokens(budget, config)

  // Simple deterministic policy: prioritize architecture/conventions/testing/workflows.
  const priority = (name: CtxBlockName): number => {
    switch (name) {
      case 'architecture':
        return 100
      case 'conventions':
        return 90
      case 'runtime':
        return 85
      case 'testing':
        return 80
      case 'workflows':
        return 70
      case 'operations':
        return 65
      case 'data':
        return 65
      default:
        return 50
    }
  }

  const sorted = [...ctxBlocks].sort((a, b) => {
    const p = priority(b.name) - priority(a.name)
    return p !== 0 ? p : a.name.localeCompare(b.name)
  })

  const selected: RenderedCtxBlock[] = []
  let used = 0

  for (const s of sorted) {
    const cost = estimateTokens(s.content)
    if (used + cost <= maxTokens) {
      selected.push(s)
      used += cost
      continue
    }

    // Try trimming this CtxBlock to fit the remaining budget.
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
