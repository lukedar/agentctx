export type Result<T, E = AgentCtxError> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: E }>

export type AgentCtxError = Readonly<{
  code: string
  message: string
  details?: unknown
  cause?: unknown
}>

export type TargetName =
  | 'agents-md'
  | 'claude'
  | 'cursor'
  | 'copilot'
  | 'llms'

export type CtxBlockName =
  | 'architecture'
  | 'conventions'
  | 'runtime'
  | 'api'
  | 'database'
  | 'operations'
  | 'data'
  | 'frontend'
  | 'testing'
  | 'workflows'
  | 'glossary'

export type TokenBudgetName = 'small' | 'medium' | 'large'

export type ContextFileCapability =
  | 'frontend'
  | 'routing'
  | 'components'
  | 'state'
  | 'api'
  | 'auth'
  | 'database'
  | 'worker'
  | 'queue'
  | 'shared-package'
  | 'schemas'
  | 'infrastructure'
  | 'deployment'
  | 'ci'

export type ContextFileCategory =
  | 'core'
  | 'root'
  | 'frontend'
  | 'backend'
  | 'worker'
  | 'package'
  | 'data'
  | 'infra'

export type ContextFileDefinition = Readonly<{
  name: string
  category: ContextFileCategory
  requiredCapabilities: readonly ContextFileCapability[]
  maxTokens: number
  priority: number
  publicSafe: boolean
}>

export type ContextFilesConfig = Readonly<{
  include?: readonly string[]
  exclude?: readonly string[]
  required?: readonly string[]
}>

export type TokenBudgets = Readonly<{
  default: TokenBudgetName
  small: number
  medium: number
  large: number
}>

export type DriftConfig = Readonly<{
  failOnCheck: boolean
  thresholdPercent: number
}>

export type SecurityConfig = Readonly<{
  redactSecrets: boolean
  includeEnvValues: boolean
  allowSourceSnippets: boolean
}>

export type CtxPointType =
  | 'frontend'
  | 'backend'
  | 'worker'
  | 'package'
  | 'infra'
  | 'docs'
  | 'unknown'

export type WorkspaceConfig = Readonly<{
  name?: string
  root?: string
  packageManager?: 'pnpm' | 'npm' | 'yarn' | 'unknown'
}>

export type CtxPointConfig = Readonly<{
  name: string
  path: string
  type?: CtxPointType
  frameworks?: readonly string[]
  dependsOn?: readonly string[]
  targets?: readonly TargetName[]
  budget?: TokenBudgetName
  include?: readonly string[]
  exclude?: readonly string[]
  contextFiles?: ContextFilesConfig
}>

export type AgentCtxConfig = Readonly<{
  rootDir: string
  workspace?: WorkspaceConfig
  scope?: Readonly<
    | { kind: 'workspace' }
    | {
        kind: 'point'
        name: string
        path: string
        type?: CtxPointType
        frameworks?: readonly string[]
        dependsOn?: readonly string[]
      }
  >
  ctxPoints: readonly CtxPointConfig[]

  targets: readonly TargetName[]
  include: readonly string[]
  exclude: readonly string[]
  ctxBlocks: Readonly<Record<CtxBlockName, boolean>>
  budgets: TokenBudgets
  drift: DriftConfig
  security: SecurityConfig
  contextFiles?: ContextFilesConfig
  allowUnsafeContextConfig?: boolean
}>

export type ContextFile = Readonly<{
  path: string
  content: string
  generated: boolean
}>

export type FactKind =
  | 'package'
  | 'package-manager'
  | 'workspace'
  | 'framework'
  | 'runtime'
  | 'language'
  | 'test-runner'
  | 'route'
  | 'api'
  | 'database'
  | 'operations'
  | 'data'
  | 'auth'
  | 'env-var'
  | 'script'
  | 'dependency'
  | 'convention'
  | 'operational'

export type OperationalFactKind =
  | 'responsibility'
  | 'dependency'
  | 'invariant'
  | 'failure-mode'
  | 'risk'
  | 'execution-path'
  | 'runtime-boundary'
  | 'security-boundary'
  | 'task-affordance'
  | 'safe-command'

export type VisibilityClass = 'public' | 'internal' | 'sensitive' | 'secret'

export type Fact = Readonly<{
  kind: FactKind
  source: string
  confidence: number
  data: Readonly<Record<string, unknown>>
}>

export type Relationship = Readonly<{
  from: string
  to: string
  type: 'depends-on' | 'imports' | 'exposes' | 'tests' | 'uses'
}>

export type AppNode = Readonly<{
  id: string
  path: string
  name?: string
  kind: 'app'
}>

export type PackageNode = Readonly<{
  id: string
  path: string
  name?: string
  kind: 'package'
}>

export type ImportantFile = Readonly<{
  path: string
  reason: string
}>

export type OperationalContextSections = Readonly<{
  responsibilities: readonly string[]
  dependencies: readonly string[]
  criticalInvariants: readonly string[]
  failureModes: readonly string[]
  safeCommands: readonly string[]
  usefulFor: readonly string[]
  unsafeChanges: readonly string[]
  evidence: readonly ImportantFile[]
}>

export type CtxBlockModel = Readonly<{
  summary: readonly string[]
  rules: readonly string[]
  workflows: readonly string[]
  files: readonly ImportantFile[]
  warnings: readonly string[]
  operational?: Partial<OperationalContextSections>
}>

export type CtxGraph = Readonly<{
  rootDir: string
  facts: readonly Fact[]
  apps: readonly AppNode[]
  packages: readonly PackageNode[]
  relationships: readonly Relationship[]
  ctxBlocks: Partial<Record<CtxBlockName, CtxBlockModel>>
}>

export type RepoFile = Readonly<{
  path: string
  size: number
  mtimeMs: number
  hash: string
}>

export type RepoFileIndex = Readonly<{
  rootDir: string
  files: readonly RepoFile[]
  byPath: Readonly<Record<string, RepoFile>>
}>

export type DetectionResult = Readonly<{
  detected: boolean
  confidence: number
  reason?: string
}>

export type DetectionSignalKind =
  | 'dependency'
  | 'script'
  | 'file'
  | 'manifest'
  | 'project-file'
  | 'source-pattern'
  | 'operational-marker'

export type DetectionSignal = Readonly<{
  kind: DetectionSignalKind
  value: string
  source: string
  detail?: string
}>

export type FrameworkEvidence = Readonly<{
  signal: DetectionSignal
  confidence: number
}>

export type FrameworkDetectionKind = Extract<FactKind, 'framework' | 'runtime'>

export type FrameworkDetection = Readonly<{
  adapterId: string
  kind: FrameworkDetectionKind
  name: string
  source: string
  confidence: number
  evidence: readonly FrameworkEvidence[]
  data?: Readonly<Record<string, unknown>>
}>

export type FrameworkAdapterPhase = 'manifest' | 'project'

export type ScanContext = Readonly<{
  rootDir: string
  files: RepoFileIndex
  paths: readonly string[]
  basenames: Readonly<Record<string, string>>
  byBasename: Readonly<Record<string, readonly string[]>>
  matchPaths: (predicate: (path: string, basename: string) => boolean) => readonly string[]
  readText: (path: string) => Promise<string>
  readJson: <T = unknown>(path: string) => Promise<T>
}>

export type AgentCtxPlugin = Readonly<{
  name: string
  detect: (ctx: ScanContext) => Promise<DetectionResult>
  extract: (ctx: ScanContext) => Promise<readonly Fact[]>
  extractWithDetection?: (ctx: ScanContext) => Promise<Readonly<{
    detection: DetectionResult
    facts: readonly Fact[]
  }>>
}>

export type FrameworkAdapter = Readonly<{
  id: string
  kind: FrameworkDetectionKind
  phase: FrameworkAdapterPhase
  priority: number
  detect: (ctx: ScanContext) => Promise<readonly FrameworkDetection[]>
}>

export type RenderedCtxBlock = Readonly<{
  name: CtxBlockName
  title: string
  content: string
  tokenEstimate: number
}>

export type RenderedContextFile = Readonly<{
  name: string
  title: string
  category: ContextFileCategory
  path: string
  content: string
  tokenEstimate: number
  publicSafe: boolean
  definition: ContextFileDefinition
  reason: string
}>

export type TargetRenderInput = Readonly<{
  graph: CtxGraph
  ctxBlocks: readonly RenderedCtxBlock[]
  contextFiles: readonly RenderedContextFile[]
  config: AgentCtxConfig
}>

export type TargetAdapter = Readonly<{
  name: TargetName
  render: (input: TargetRenderInput) => Promise<readonly ContextFile[]>
}>
