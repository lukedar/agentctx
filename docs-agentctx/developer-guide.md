# Developer Guide

<div class="docs-hero">
  <span class="docs-kicker">Coding and API internals</span>
  <h1>How senior engineers should work on AgentCtx.</h1>
  <p class="docs-lead">
    This guide explains the internal contracts, implementation patterns, and engineering standards that matter when extending the AgentCtx compiler, adapters, targets, CLI, and evaluation tooling.
  </p>
</div>

AgentCtx should be treated as a deterministic compiler, not a docs generator with incidental parsing. Most implementation decisions should preserve three properties:

- repo evidence is normalized before it becomes prose
- generated output is stable, scoped, and safe to share only when marked public-safe
- each package owns one layer of the pipeline

## Package Boundaries

<div class="docs-grid">
  <div class="docs-card docs-span-4"><h3><code>@agentctx/core</code></h3><p>Configuration, repo indexing, plugin contracts, fact extraction, graph building, Context Blocks, context-file selection, and shared public types.</p></div>
  <div class="docs-card docs-span-4"><h3><code>@agentctx/adapters</code></h3><p>Framework and repository evidence extraction. Adapters emit facts; they do not render Markdown or write files.</p></div>
  <div class="docs-card docs-span-4"><h3><code>@agentctx/targets</code></h3><p>Target renderers for AGENTS.md, CLAUDE.md, Cursor, Copilot, and llms.txt. Targets format selected context only.</p></div>
  <div class="docs-card docs-span-4"><h3><code>agentctx</code></h3><p>The CLI orchestration layer. It wires config, build, plan, explain, sync, check, caching, JSON output, and process exit behavior.</p></div>
  <div class="docs-card docs-span-4"><h3><code>dual-agent-runner</code></h3><p>Evaluation, scoring, task plans, reports, benchmark comparisons, and step-gated quality workflows.</p></div>
  <div class="docs-card docs-span-4"><h3><code>dual-agent-runner-ui</code></h3><p>Optional UI/server surface for runner telemetry. It depends on runner contracts rather than owning compiler behavior.</p></div>
</div>

Keep package dependencies directional:

```text
core -> no internal package dependencies
adapters -> core
targets -> core
cli -> core + adapters + targets
dual-agent-runner-ui -> dual-agent-runner
```

## Compiler Flow

The main build path lives in the CLI build library and should stay readable as a compiler pipeline:

```text
load config
  -> resolve workspace / CtxPoint scope
  -> create deterministic file index
  -> extract facts with plugins
  -> build context graph
  -> plan Context Blocks
  -> select and render context files
  -> render target surfaces
  -> write only changed files
```

The important design rule is that later stages should not re-discover earlier evidence. If a target needs a framework, route, package, or operation fact, that evidence should already exist in normalized facts or graph data.

## Public API Contracts

The most important exported contracts are in `@agentctx/core`.

| Contract | Role | Implementation expectation |
|---|---|---|
| `AgentCtxConfig` | Normalized compiler configuration | Add fields through config normalization and tests, not ad hoc CLI parsing. |
| `RepoFileIndex` | Stable indexed input state | Preserve sorted, hashed, filtered paths. Avoid direct filesystem walks after indexing. |
| `Fact` | Normalized adapter output | Include `kind`, `source`, `confidence`, and structured `data`. Facts must be evidence-backed. |
| `CtxGraph` | Structural model | Build from facts and config. Do not embed rendered Markdown here. |
| `ContextFileDefinition` | Context-file registry entry | Use capabilities, priority, token budget, category, and public-safe metadata. |
| `AgentCtxPlugin` | Adapter plugin interface | Detect first, then extract facts. Use `extractWithDetection` when detection work can be reused. |
| `TargetAdapter` | Output renderer interface | Render selected context into target files without rescanning the repo. |

Core code generally returns `Result<T>` at boundaries where user input, config, filesystem indexing, or plugin execution can fail:

```ts
export type Result<T, E = AgentCtxError> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: E }>
```

Use typed error objects for recoverable compiler failures. Throwing is acceptable inside command orchestration only after a typed boundary has already made the failure clear.

## Extension Patterns

### Add an adapter plugin

Use the scan context helpers instead of walking the filesystem yourself.

```ts
export const examplePlugin: AgentCtxPlugin = {
  name: 'example',

  async detect(ctx) {
    const detected = ctx.paths.some((p) => p.endsWith('example.config.ts'))
    return {
      detected,
      confidence: detected ? 0.9 : 0,
      reason: detected ? 'Detected example config' : 'No example config found',
    }
  },

  async extract(ctx) {
    return ctx.matchPaths((p) => p.endsWith('example.config.ts')).map((source) => ({
      kind: 'framework',
      source,
      confidence: 0.9,
      data: { name: 'example' },
    }))
  },
}
```

Plugin standards:

- emit compact facts, not summaries
- include a source path for every fact
- keep confidence meaningful and conservative
- sort or rely on core fact sorting; never depend on filesystem order
- avoid reading the same file repeatedly; `ScanContext` caches text and JSON reads

### Add a context file

Context files are selected from a registry and should represent a meaningful task surface.

```ts
definition('api', 'backend', ['api'], 1800, 84, true)
```

When adding one, define:

- category: where it belongs in the taxonomy
- required capabilities: what evidence must exist
- max token budget: expected upper bound for generated context
- priority: deterministic selection order
- public-safe flag: whether it can flow into public outputs

### Add a target renderer

Targets should only format selected Context Blocks and rendered context files.

```ts
export const exampleTarget: TargetAdapter = {
  name: 'agents-md',

  async render(input) {
    return [
      {
        path: 'AGENTS.md',
        generated: true,
        content: renderGeneratedBlock(renderedBody),
      },
    ]
  },
}
```

Target standards:

- do not call adapters or scan the repo
- wrap generated regions with target utilities where supported
- keep output deterministic and stable for review diffs
- preserve visibility expectations; do not place internal-only guidance in public-safe surfaces

### Add a CLI command

Commands register with `cac`, parse flags at the edge, and delegate work to library functions.

```ts
type ExampleCommandFlags = Readonly<{
  cwd?: string
  json?: boolean
}>

export const registerExampleCommand = (cli: CAC): void => {
  cli
    .command('example', 'Describe the command')
    .option('--cwd <dir>', 'Working directory')
    .option('--json', 'Machine-readable output')
    .action(async (flags: ExampleCommandFlags) => {
      const cwd = resolveCwd(flags.cwd)
      const result = await runExample({ cwd })
      if (flags.json) console.log(JSON.stringify(result, null, 2))
    })
}
```

CLI standards:

- global flags are `--cwd` and `--json`
- JSON output should be stable and machine-readable
- command modules should stay thin; put behavior in `src/lib`
- set `process.exitCode` for expected command failure instead of crashing after partial output

## Safety and Determinism

Generated context becomes trusted by agents, so changes should be conservative.

- Sort facts, selected files, rendered sections, and output lists deterministically.
- Do not include timestamps in generated files.
- Redact secrets before writing generated JSON, Markdown, or target output.
- Treat `security.md`, `boundaries.md`, `auth`, `database`, `queues`, `deployments`, `secrets`, `permissions`, and release context as internal unless explicitly public-safe.
- Preserve manual edits outside generated blocks during sync.
- Prefer metadata and high-signal config over full source dumps.

## Testing Standards

Use the smallest suite that covers the changed contract.

| Change type | Expected checks |
|---|---|
| Core config, graph, context files, repo indexing | `pnpm -C packages/core test` and typecheck |
| Adapter or framework evidence | `pnpm -C packages/adapters test` and targeted fixture tests |
| Target rendering | `pnpm -C packages/targets test` with stable output assertions |
| CLI behavior, sync, JSON output, drift | `pnpm -C packages/cli test` |
| Runner scoring, reports, benchmarks | `pnpm -C packages/dual-agent-runner test` |
| Docs changes | `VITEPRESS_BASE=/agentctx/ pnpm -C docs-agentctx build` |

Before release-oriented work, run:

```bash
pnpm run typecheck
pnpm run test
pnpm run build
```

## Standards Alignment Plan

These practices are partly present today and should be made explicit or enforceable.

<div class="docs-grid">
  <div class="docs-card docs-span-6">
    <h3>Formatting and linting</h3>
    <p>Add a repo-wide formatter/linter policy so generated and hand-written TypeScript stay consistent beyond TypeScript strict mode.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>API compatibility</h3>
    <p>Define which exported types are public API, how breaking changes are reviewed, and how JSON output contracts evolve.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Fact schema discipline</h3>
    <p>Document per-kind fact data shapes so adapters do not drift into incompatible custom payloads.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Release versioning</h3>
    <p>Move beyond package version <code>0.0.0</code> with a clear prerelease, changelog, and migration-note process.</p>
  </div>
</div>

Recommended order:

1. Add lint/format scripts and CI checks.
2. Mark public API exports and JSON output shapes as compatibility-sensitive.
3. Add adapter fact-shape documentation beside tests.
4. Define release and migration notes before the first public package release.

The standard to aim for is simple: every agent-facing output should be explainable from typed inputs, deterministic compiler stages, and tests that pin the behavior.
