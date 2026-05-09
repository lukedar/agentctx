import type {
  AgentCtxPlugin,
  DetectionResult,
  DetectionSignal,
  Fact,
  FrameworkAdapter,
  FrameworkDetection,
  FrameworkDetectionKind,
  ScanContext,
} from '@agentctx/core'

import { getAllDeps, listPackageJsonPaths, readPackageJsonSafe, type PackageJson } from './utils/packageJson'

type SignalMatch = Readonly<{
  signal: DetectionSignal
  confidence: number
}>

type PackageMatchOptions = Readonly<{
  dependencies?: readonly string[]
  scripts?: readonly string[]
  manifests?: readonly string[]
}>

type TextManifestMatchOptions = Readonly<{
  files: readonly string[]
  tokens: readonly string[]
  signalKind?: DetectionSignal['kind']
  detail?: string
  confidence?: number
}>

type AdapterDefinition = Readonly<{
  id: string
  kind: FrameworkDetectionKind
  name: string
  phase?: FrameworkAdapter['phase']
  priority?: number
  detect: (ctx: ScanContext) => Promise<readonly SignalMatch[]>
  data?: Readonly<Record<string, unknown>>
}>

const filePaths = (ctx: ScanContext): readonly string[] => ctx.files.files.map((file) => file.path)
const basename = (filePath: string): string => filePath.split('/').at(-1) ?? filePath

const findNamedFiles = (
  ctx: ScanContext,
  targetFileNames: readonly string[],
  signalKind: DetectionSignal['kind'],
  detail: string,
  confidence: number,
): readonly SignalMatch[] => {
  const names = new Set(targetFileNames)
  return findPaths(
    ctx,
    (filePath) => names.has(basename(filePath)),
    signalKind,
    detail,
    confidence,
  )
}

const findPaths = (
  ctx: ScanContext,
  predicate: (path: string) => boolean,
  signalKind: DetectionSignal['kind'],
  detail: string,
  confidence: number,
): readonly SignalMatch[] =>
  filePaths(ctx)
    .filter(predicate)
    .map((path) => ({
      signal: {
        kind: signalKind,
        value: path,
        source: path,
        detail,
      },
      confidence,
    }))

const manifestFieldSignals = async (
  ctx: ScanContext,
  options: PackageMatchOptions,
): Promise<readonly SignalMatch[]> => {
  const matches: SignalMatch[] = []

  for (const packageJsonPath of listPackageJsonPaths(ctx)) {
    const pkg = await readPackageJsonSafe(ctx, packageJsonPath)
    if (!pkg) continue

    const deps = getAllDeps(pkg)
    for (const dependencyName of options.dependencies ?? []) {
      if (!deps[dependencyName]) continue
      matches.push({
        signal: {
          kind: 'dependency',
          value: dependencyName,
          source: packageJsonPath,
          detail: 'dependency declared in package.json',
        },
        confidence: 0.9,
      })
    }

    const scripts = pkg.scripts ?? {}
    for (const scriptName of options.scripts ?? []) {
      const command = scripts[scriptName]
      if (!command) continue
      matches.push({
        signal: {
          kind: 'script',
          value: scriptName,
          source: packageJsonPath,
          detail: command,
        },
        confidence: 0.65,
      })
    }

    for (const manifestName of options.manifests ?? []) {
      if (!hasManifestMarker(pkg, manifestName)) continue
      matches.push({
        signal: {
          kind: 'manifest',
          value: manifestName,
          source: packageJsonPath,
          detail: 'manifest field present',
        },
        confidence: 0.7,
      })
    }
  }

  return matches
}

const textManifestSignals = async (
  ctx: ScanContext,
  options: TextManifestMatchOptions,
): Promise<readonly SignalMatch[]> => {
  const matches: SignalMatch[] = []
  const fileNames = new Set(options.files)

  for (const filePath of filePaths(ctx).filter((candidate) =>
    fileNames.has(basename(candidate)),
  )) {

    let content = ''
    try {
      content = await ctx.readText(filePath)
    } catch {
      continue
    }

    for (const token of options.tokens) {
      if (!content.includes(token)) continue
      matches.push({
        signal: {
          kind: options.signalKind ?? 'manifest',
          value: token,
          source: filePath,
          detail: options.detail ?? 'token matched in project manifest',
        },
        confidence: options.confidence ?? 0.88,
      })
    }
  }

  return matches
}

const hasManifestMarker = (pkg: PackageJson, marker: string): boolean => {
  if (marker === 'engines.node') return Boolean(pkg.engines?.node)
  if (marker === 'workspaces') return Array.isArray(pkg.workspaces) || typeof pkg.workspaces === 'object'
  return false
}

const clampConfidence = (confidence: number): number => Math.max(0.5, Math.min(0.98, confidence))

const combineConfidence = (matches: readonly SignalMatch[]): number => {
  const total = matches.reduce((sum, match) => sum + match.confidence, 0)
  return clampConfidence(total / Math.max(matches.length, 1) + Math.min(0.12, matches.length * 0.03))
}

const uniqueBy = <T>(items: readonly T[], key: (item: T) => string): readonly T[] => {
  const seen = new Set<string>()
  const output: T[] = []

  for (const item of items) {
    const itemKey = key(item)
    if (seen.has(itemKey)) continue
    seen.add(itemKey)
    output.push(item)
  }

  return output
}

const createFrameworkAdapter = (definition: AdapterDefinition): FrameworkAdapter => ({
  id: definition.id,
  kind: definition.kind,
  phase: definition.phase ?? 'manifest',
  priority: definition.priority ?? 50,
  detect: async (ctx) => {
    const matches = uniqueBy(await definition.detect(ctx), (match) =>
      `${match.signal.kind}:${match.signal.source}:${match.signal.value}`,
    )
    if (matches.length === 0) return []

    const source = matches
      .map((match) => match.signal.source)
      .sort((a, b) => a.localeCompare(b))[0] ?? definition.id

    return [{
      adapterId: definition.id,
      kind: definition.kind,
      name: definition.name,
      source,
      confidence: combineConfidence(matches),
      evidence: matches.map((match) => ({
        signal: match.signal,
        confidence: match.confidence,
      })),
      ...(definition.data ? { data: definition.data } : {}),
    }]
  },
})

const createPackageFrameworkAdapter = (input: {
  id: string
  name: string
  dependencies?: readonly string[]
  scripts?: readonly string[]
  manifests?: readonly string[]
  files?: readonly string[]
  sourcePatterns?: readonly RegExp[]
  phase?: FrameworkAdapter['phase']
  priority?: number
}): FrameworkAdapter =>
  createFrameworkAdapter({
    id: input.id,
    kind: 'framework',
    name: input.name,
    ...(input.phase ? { phase: input.phase } : {}),
    ...(input.priority === undefined ? {} : { priority: input.priority }),
    detect: async (ctx) => {
      const matches: SignalMatch[] = [...await manifestFieldSignals(ctx, input)]

      matches.push(...findNamedFiles(
        ctx,
        input.files ?? [],
        'file',
        'framework config or project marker',
        0.85,
      ))

      for (const pattern of input.sourcePatterns ?? []) {
        matches.push(...findPaths(
          ctx,
          (filePath) => pattern.test(filePath),
          'source-pattern',
          `matched ${pattern}`,
          0.55,
        ))
      }

      return matches
    },
  })

const createRuntimeAdapter = (input: {
  id: string
  name: string
  dependencies?: readonly string[]
  scripts?: readonly string[]
  manifests?: readonly string[]
  files?: readonly string[]
  sourcePatterns?: readonly RegExp[]
  phase?: FrameworkAdapter['phase']
  priority?: number
}): FrameworkAdapter =>
  createFrameworkAdapter({
    id: input.id,
    kind: 'runtime',
    name: input.name,
    ...(input.phase ? { phase: input.phase } : {}),
    ...(input.priority === undefined ? {} : { priority: input.priority }),
    detect: async (ctx) => {
      const matches: SignalMatch[] = [...await manifestFieldSignals(ctx, input)]

      matches.push(...findNamedFiles(
        ctx,
        input.files ?? [],
        'project-file',
        'runtime project marker',
        0.88,
      ))

      for (const pattern of input.sourcePatterns ?? []) {
        matches.push(...findPaths(
          ctx,
          (filePath) => pattern.test(filePath),
          'source-pattern',
          `matched ${pattern}`,
          0.58,
        ))
      }

      return matches
    },
  })

const detectDotnetProjectFiles = (ctx: ScanContext): readonly SignalMatch[] => [
  ...findPaths(ctx, (path) => path.endsWith('.sln'), 'project-file', '.NET solution file', 0.92),
  ...findPaths(ctx, (path) => path.endsWith('.csproj'), 'project-file', '.NET project file', 0.92),
  ...findPaths(ctx, (path) => path.endsWith('Directory.Build.props'), 'project-file', '.NET directory props', 0.82),
]

const dotnetRuntimeAdapter = createFrameworkAdapter({
  id: 'runtime-dotnet',
  kind: 'runtime',
  name: 'dotnet',
  phase: 'project',
  priority: 20,
  detect: async (ctx) => detectDotnetProjectFiles(ctx),
})

const aspnetCoreFrameworkAdapter = createFrameworkAdapter({
  id: 'framework-aspnetcore',
  kind: 'framework',
  name: 'aspnetcore',
  phase: 'project',
  priority: 30,
  detect: async (ctx) => {
    const projectFiles = filePaths(ctx).filter((filePath) => filePath.endsWith('.csproj'))
    const matches: SignalMatch[] = []

    for (const projectFile of projectFiles) {
      let content = ''
      try {
        content = await ctx.readText(projectFile)
      } catch {
        continue
      }

      if (content.includes('Microsoft.NET.Sdk.Web')) {
        matches.push({
          signal: {
            kind: 'project-file',
            value: 'Microsoft.NET.Sdk.Web',
            source: projectFile,
            detail: 'web SDK project',
          },
          confidence: 0.95,
        })
      }

      if (content.includes('Microsoft.AspNetCore')) {
        matches.push({
          signal: {
            kind: 'project-file',
            value: 'Microsoft.AspNetCore',
            source: projectFile,
            detail: 'aspnet package or framework reference',
          },
          confidence: 0.88,
        })
      }
    }

    matches.push(...findPaths(
      ctx,
      (filePath) => filePath.endsWith('Program.cs'),
      'source-pattern',
      'Program.cs entrypoint',
      0.55,
    ))

    return matches
  },
})

const pythonFrameworkAdapter = (input: {
  id: string
  name: string
  tokens: readonly string[]
  files?: readonly string[]
}): FrameworkAdapter =>
  createFrameworkAdapter({
    id: input.id,
    kind: 'framework',
    name: input.name,
    phase: 'project',
    priority: 35,
    detect: async (ctx) => textManifestSignals(ctx, {
      files: input.files ?? ['pyproject.toml', 'requirements.txt', 'requirements-dev.txt'],
      tokens: input.tokens,
      detail: 'python framework marker',
      confidence: 0.9,
    }),
  })

const pythonRuntimeAdapter = createRuntimeAdapter({
  id: 'runtime-python',
  name: 'python',
  phase: 'project',
  priority: 20,
  files: ['pyproject.toml', 'requirements.txt', 'requirements-dev.txt', 'Pipfile', 'uv.lock', 'poetry.lock', 'setup.py'],
  sourcePatterns: [/^src\/[^/]+\/__init__\.py$/, /^app\/.*\.py$/, /^main\.py$/],
})

const nodeRuntimeAdapter = createRuntimeAdapter({
  id: 'runtime-node',
  name: 'node',
  priority: 10,
  files: ['package.json'],
  manifests: ['engines.node', 'workspaces'],
  scripts: ['start', 'dev', 'build', 'test'],
  sourcePatterns: [/^src\/.*\.[cm]?[jt]sx?$/, /^server\.[cm]?[jt]s$/, /^index\.[cm]?[jt]s$/],
})

const reactFrameworkAdapter = createPackageFrameworkAdapter({
  id: 'framework-react',
  name: 'react',
  dependencies: ['react', 'react-dom'],
  files: ['vite.config.ts', 'vite.config.js', 'next.config.js', 'next.config.mjs'],
  sourcePatterns: [/\.tsx$/, /\.jsx$/],
  priority: 40,
})

const angularFrameworkAdapter = createPackageFrameworkAdapter({
  id: 'framework-angular',
  name: 'angular',
  dependencies: ['@angular/core'],
  files: ['angular.json'],
  sourcePatterns: [/src\/app\/.*\.ts$/],
  priority: 40,
})

const packageFrameworkAdapter = (input: {
  id: string
  name: string
  dependencies: readonly string[]
  priority?: number
}): FrameworkAdapter =>
  createPackageFrameworkAdapter({
    id: input.id,
    name: input.name,
    dependencies: input.dependencies,
    ...(input.priority === undefined ? {} : { priority: input.priority }),
  })

export const frameworkAdapterRegistry: readonly FrameworkAdapter[] = [
  nodeRuntimeAdapter,
  dotnetRuntimeAdapter,
  pythonRuntimeAdapter,
  reactFrameworkAdapter,
  angularFrameworkAdapter,
  aspnetCoreFrameworkAdapter,
  packageFrameworkAdapter({ id: 'framework-next', name: 'next', dependencies: ['next'] }),
  packageFrameworkAdapter({ id: 'framework-vite', name: 'vite', dependencies: ['vite'] }),
  packageFrameworkAdapter({ id: 'framework-express', name: 'express', dependencies: ['express'] }),
  packageFrameworkAdapter({ id: 'framework-fastify', name: 'fastify', dependencies: ['fastify'] }),
  packageFrameworkAdapter({ id: 'framework-nest', name: 'nestjs', dependencies: ['@nestjs/core'] }),
  packageFrameworkAdapter({ id: 'framework-hono', name: 'hono', dependencies: ['hono'] }),
  packageFrameworkAdapter({ id: 'framework-sveltekit', name: 'sveltekit', dependencies: ['@sveltejs/kit'] }),
  packageFrameworkAdapter({ id: 'framework-nuxt', name: 'nuxt', dependencies: ['nuxt'] }),
  packageFrameworkAdapter({ id: 'framework-astro', name: 'astro', dependencies: ['astro'] }),
  packageFrameworkAdapter({ id: 'framework-remix', name: 'remix', dependencies: ['remix'] }),
  pythonFrameworkAdapter({ id: 'framework-fastapi', name: 'fastapi', tokens: ['fastapi'] }),
  pythonFrameworkAdapter({ id: 'framework-django', name: 'django', tokens: ['django'] }),
  pythonFrameworkAdapter({ id: 'framework-flask', name: 'flask', tokens: ['flask'] }),
]

const sortAdapters = (adapters: readonly FrameworkAdapter[]): readonly FrameworkAdapter[] =>
  [...adapters].sort((left, right) => {
    const phaseOrder = phasePriority(left.phase) - phasePriority(right.phase)
    if (phaseOrder !== 0) return phaseOrder

    const priorityOrder = left.priority - right.priority
    if (priorityOrder !== 0) return priorityOrder

    return left.id.localeCompare(right.id)
  })

const phasePriority = (phase: FrameworkAdapter['phase']): number => {
  switch (phase) {
    case 'manifest':
      return 10
    case 'project':
      return 20
    default:
      return 99
  }
}

const sortDetections = (detections: readonly FrameworkDetection[]): readonly FrameworkDetection[] =>
  [...detections].sort((left, right) => {
    const kindOrder = left.kind.localeCompare(right.kind)
    if (kindOrder !== 0) return kindOrder

    const nameOrder = left.name.localeCompare(right.name)
    if (nameOrder !== 0) return nameOrder

    return left.source.localeCompare(right.source)
  })

const dedupeDetections = (detections: readonly FrameworkDetection[]): readonly FrameworkDetection[] => {
  const merged = new Map<string, FrameworkDetection>()

  for (const detection of detections) {
    const key = `${detection.kind}:${detection.name}:${detection.source}`
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, detection)
      continue
    }

    merged.set(key, {
      ...existing,
      confidence: Math.max(existing.confidence, detection.confidence),
      evidence: uniqueBy(
        [...existing.evidence, ...detection.evidence],
        (evidence) => `${evidence.signal.kind}:${evidence.signal.source}:${evidence.signal.value}`,
      ),
    })
  }

  return sortDetections([...merged.values()])
}

export const detectFrameworks = async (
  ctx: ScanContext,
  adapters: readonly FrameworkAdapter[] = frameworkAdapterRegistry,
): Promise<readonly FrameworkDetection[]> => {
  const detections: FrameworkDetection[] = []

  for (const adapter of sortAdapters(adapters)) {
    const adapterDetections = await adapter.detect(ctx)
    for (const detection of adapterDetections) detections.push(detection)
  }

  return dedupeDetections(detections)
}

const detectionToFact = (detection: FrameworkDetection): Fact => ({
  kind: detection.kind,
  source: detection.source,
  confidence: detection.confidence,
  data: {
    name: detection.name,
    adapter: detection.adapterId,
    evidence: detection.evidence.map((entry) => ({
      kind: entry.signal.kind,
      value: entry.signal.value,
      source: entry.signal.source,
    })),
    ...(detection.data ?? {}),
  },
})

export const frameworkAdaptersPlugin: AgentCtxPlugin = {
  name: 'framework-adapters',

  async detect(ctx): Promise<DetectionResult> {
    const detections = await detectFrameworks(ctx)
    const confidence = detections.reduce((max, detection) => Math.max(max, detection.confidence), 0)

    return {
      detected: detections.length > 0,
      confidence,
      reason: detections.length > 0
        ? `Detected ${detections.length} framework/runtime signals`
        : 'No framework adapter signals matched',
    }
  },

  async extract(ctx): Promise<readonly Fact[]> {
    return (await detectFrameworks(ctx)).map(detectionToFact)
  },
}

export const frameworksFromPackageJsonPlugin = frameworkAdaptersPlugin
