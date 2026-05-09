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

export type ContextBlockName =
  | 'architecture'
  | 'conventions'
  | 'runtime'
  | 'api'
  | 'database'
  | 'frontend'
  | 'testing'
  | 'workflows'
  | 'glossary'

export type TokenBudgetName = 'small' | 'medium' | 'large'

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

export type ContextPointType =
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

export type ContextPointConfig = Readonly<{
  name: string
  path: string
  type?: ContextPointType
  frameworks?: readonly string[]
  dependsOn?: readonly string[]
  targets?: readonly TargetName[]
  budget?: TokenBudgetName
  include?: readonly string[]
  exclude?: readonly string[]
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
        type?: ContextPointType
        frameworks?: readonly string[]
        dependsOn?: readonly string[]
      }
  >
  contextPoints: readonly ContextPointConfig[]

  targets: readonly TargetName[]
  include: readonly string[]
  exclude: readonly string[]
  contextBlocks: Readonly<Record<ContextBlockName, boolean>>
  budgets: TokenBudgets
  drift: DriftConfig
  security: SecurityConfig
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
  | 'auth'
  | 'env-var'
  | 'script'
  | 'dependency'
  | 'convention'

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

export type ContextBlockModel = Readonly<{
  summary: readonly string[]
  rules: readonly string[]
  workflows: readonly string[]
  files: readonly ImportantFile[]
  warnings: readonly string[]
}>

export type ContextGraph = Readonly<{
  rootDir: string
  facts: readonly Fact[]
  apps: readonly AppNode[]
  packages: readonly PackageNode[]
  relationships: readonly Relationship[]
  contextBlocks: Partial<Record<ContextBlockName, ContextBlockModel>>
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
  readText: (path: string) => Promise<string>
  readJson: <T = unknown>(path: string) => Promise<T>
}>

export type AgentCtxPlugin = Readonly<{
  name: string
  detect: (ctx: ScanContext) => Promise<DetectionResult>
  extract: (ctx: ScanContext) => Promise<readonly Fact[]>
}>

export type FrameworkAdapter = Readonly<{
  id: string
  kind: FrameworkDetectionKind
  phase: FrameworkAdapterPhase
  priority: number
  detect: (ctx: ScanContext) => Promise<readonly FrameworkDetection[]>
}>

export type RenderedContextBlock = Readonly<{
  name: ContextBlockName
  title: string
  content: string
  tokenEstimate: number
}>

export type TargetRenderInput = Readonly<{
  graph: ContextGraph
  contextBlocks: readonly RenderedContextBlock[]
  config: AgentCtxConfig
}>

export type TargetAdapter = Readonly<{
  name: TargetName
  render: (input: TargetRenderInput) => Promise<readonly ContextFile[]>
}>
