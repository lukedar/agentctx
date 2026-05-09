# Architecture

This page is the code schematic for AgentCtx.

Read it as the map of how the framework works:
- where the data enters
- how it is normalized
- how the compiler stages are separated
- why each package owns its own concern
- how the runtime stays deterministic

## Contents

- [Compiler model](#compiler-model)
- [Application flow](#application-flow)
- [Module schematic](#module-schematic)
- [Data contracts](#data-contracts)
- [Pipeline stages](#pipeline-stages)
- [Package boundaries](#package-boundaries)
- [Coding patterns](#coding-patterns)
- [Sync and validation](#sync-and-validation)
- [Developer reading order](#developer-reading-order)

## Compiler model

<img src="/diagrams/application-flow.svg" alt="AgentCtx application flow diagram" />

AgentCtx is a compiler, not a crawler.

The repo is treated as an input graph and compiled into output artifacts.

The runtime is built as a pipeline:
1. load config
2. resolve workspace or point scope
3. index files deterministically
4. extract facts from metadata
5. build the graph
6. plan context blocks
7. render target files
8. write outputs and sync them
9. validate drift and quality

The pipeline shape exists so each stage has one job and one failure mode.

## Application flow

### Why the flow is staged

Each stage is intentionally narrow:
- config decides what scope exists
- index decides what files are visible
- facts decide what signals matter
- graph decides what the signals mean structurally
- context blocks decide how that meaning is explained
- targets decide how the explanation is written
- sync decides where the generated files land
- check decides whether the repo has drifted

That staging is what lets the repo support workspace output and point output with the same code path.

### Application diagram

<img src="/diagrams/application-flow.svg" alt="AgentCtx application flow diagram" />

## Module schematic

<img src="/diagrams/architecture-schematic.svg" alt="AgentCtx architecture schematic" />

The package boundary is intentional:
- `core` owns the compiler primitives and deterministic transformation logic
- `adapters` owns repo detectors, framework adapters, and metadata extraction
- `targets` owns presentation and output formatting
- `cli` owns orchestration, file writes, sync, and commands
- `dual-agent-runner` owns evaluation and iteration control

That split exists for three reasons:
- it prevents presentation code from leaking into the compiler
- it keeps repo scanning logic out of the CLI layer
- it makes each package independently testable

## Data contracts

The codebase works because the handoff between layers is explicit.

Important contracts:
- `AgentCtxConfig` is the normalized runtime config
- `RepoFileIndex` is the filtered, hashed file view
- `Fact` is a normalized signal from a detector
- `ContextGraph` is the compiled structural model
- `RenderedContextBlock` is the rendered context-block output
- `ContextFile` is the final render artifact

Each contract narrows the allowed shape of the data.
That is how the framework avoids passing opaque objects across layers.

Terminology:
- a context point is a directory boundary selected for scoped context generation
- a point produces a set of context blocks
- each context block is one thematic slice of context for that point
- a block references and summarizes the important files for that topic rather than embedding the whole point

### Deterministic input, deterministic output

The framework tries to make the same input produce the same output.

That is why the implementation emphasizes:
- stable file ordering
- sorted facts and relationships
- explicit filtering
- no timestamped output
- controlled redaction

If an output changes, the cause should be explainable from the repo state or config.

### Metadata first

The repo scan prefers manifests and metadata over full source parsing.

This is deliberate:
- metadata is cheaper to scan
- metadata is less noisy
- metadata usually captures the architectural shape a developer needs first

The framework only reaches for source-heavy logic when metadata is not enough.

### Shared model, multiple targets

The same graph and context-block model feed every generated output.

That means:
- `AGENTS.md`, `CLAUDE.md`, `llms.txt`, and the others do not re-scan the repo
- output differences come from formatting, not from independent interpretation

This reduces drift between targets and keeps the behavior easier to test.

## Pipeline stages

### 1. Config

`agentctx.config.ts` defines the repo contract:
- targets
- include/exclude rules
- context points
- scope metadata

This is the only place the repo should describe itself to the compiler.

Why it matters:
- it gives the runtime one source of truth
- it keeps the rest of the code free of CLI-specific assumptions

### 2. Scope resolution

The CLI decides whether it is compiling:
- the whole workspace
- one point
- multiple points

Scope is a first-class concept because the output is boundary-aware.

Why it matters:
- the workspace is the global view
- a point is the focused view
- both should share the same compiler, not fork into separate tools

### 3. File indexing

The indexer walks the selected scope, filters generated directories, and hashes what remains.

This is where the framework protects itself from noise and self-reference.

Why it matters:
- generated files should not recursively define more generated files
- hashing lets the system detect drift and reuse cached work

### 4. Facts

Adapters translate file signals into normalized facts.

Facts are intentionally small and typed:
- package metadata
- framework hints
- runtime markers
- route patterns
- scripts
- test runners

The framework should describe the repo, not dump the repo.

Why it matters:
- a small fact is easier to test than a source parser
- a small fact is easier to sort deterministically
- a small fact is easier to redact and persist safely

### Framework adapters inside the fact stage

Framework detection now runs through a dedicated adapter registry rather than one package-json-only plugin.

That layer separates two concerns:
- generic scanners gather repo signals such as package manifests, project files, scripts, and source markers
- framework adapters turn those signals into deterministic `framework` and `runtime` facts

The registry model exists to make extension safer:
- React and Angular stay simple package-based adapters
- Node, .NET, and Python can use project-file and manifest markers without being forced through `package.json`
- contributors add one adapter definition instead of editing hidden ordering logic across multiple plugins

### 5. Graph

The graph compiles facts into structure:
- app/package nodes
- dependency edges
- scope membership
- path relationships

This is the layer that makes the context useful for a developer trying to understand boundaries.

Why it matters:
- facts answer what exists
- the graph answers how it is connected
- the context-block planner answers how it should be read

### 6. Context blocks

Context blocks turn point structure into readable developer guidance.

The important rule is that context blocks are not prose essays. They are structured explanations with:
- summary
- rules
- workflows
- important files

That format is why they stay readable and still machine-generated.

Why it matters:
- developers need concise explanations, not raw scan output
- the same context-block layout can feed multiple output formats

### 7. Targets

Targets are just renderers.

Each one takes the same context-block model and writes a different instruction file layout.

Examples:
- `AGENTS.md` focuses on agent instructions
- `CLAUDE.md` focuses on Claude project context
- `.cursor/rules/project.mdc` carries editor rules
- `llms.txt` acts as a compact index

Why it matters:
- target code should never decide what to scan
- target code should only decide how to write

### 8. Sync

Sync is the mutation layer.

It must preserve manual edits outside generated blocks and only update the generated parts.

That separation is what lets teams keep handwritten guidance alongside generated context.

Why it matters:
- generated files must coexist with human-written text
- repeated sync should be safe

### 9. Check

Check exists because generated output can drift from the repo as files change.

It is the validation layer that keeps generated context honest.

Why it matters:
- drift is an implementation fact, not a special case
- check gives you a repeatable way to detect stale outputs before review or CI

## Package boundaries

### `core`

`core` contains the compiler logic because compiler code needs to stay deterministic and testable.

If it were mixed into the CLI or target renderers, regressions would become harder to isolate.

What belongs here:
- config normalization
- file indexing
- facts and graph types
- context-block planning
- deterministic shared utilities

What does not belong here:
- filesystem writes
- CLI parsing
- target-specific formatting
- runner orchestration

### `adapters`

Adapters should be lightweight heuristics, not AST machinery.

That keeps them cheap, predictable, and easy to extend.

What belongs here:
- file signatures
- package metadata
- framework heuristics
- tool detection

What does not belong here:
- generated output formatting
- sync logic
- command parsing

### `targets`

Targets should not decide what the repo means.

They should only decide how the same meaning is written out.

What belongs here:
- target-specific rendering
- context-block formatting
- instruction-file layout

What does not belong here:
- scanning the repo
- building the graph
- modifying sync semantics

### `cli`

The CLI exists to stitch the pipeline together, not to own business logic.

That separation keeps command behavior consistent across `build`, `sync`, and `check`.

What belongs here:
- command parsing
- scope resolution
- orchestration
- output writing
- status reporting

What does not belong here:
- detector heuristics
- target formatting
- graph semantics

### `dual-agent-runner`

The dual-agent runner owns evaluation and iteration control.

It stays separate because it is an evaluator layer, not part of the compiler.

What belongs here:
- scoring
- task plans
- evaluator prompts
- reports
- gate orchestration

What does not belong here:
- repo scanning
- target rendering
- sync mutations

## Coding patterns

### One layer, one responsibility

The framework deliberately avoids mixing concerns in the same file or package.

That makes the code easier to:
- test
- reason about
- change without side effects

### Shared model, no duplicate logic

The same graph and context-block model feed workspace outputs, point outputs, and target renderers.

That prevents each surface from developing its own interpretation of the repo.

### Deterministic ordering everywhere

Stable ordering is a core coding rule.

Use it for:
- files
- facts
- relationships
- context blocks
- output files

If ordering is unstable, the generated context becomes noisy.

### Metadata over source dumps

Prefer manifests and high-signal config over full source scans.

That keeps outputs useful for developers without drowning them in implementation detail.

### Redaction before persistence

Secret-safe output is a hard requirement.

Generated artifacts should be redacted before they are written to disk.

## Sync and validation

Sync and check are the guardrails around the compiler.

Sync:
- merges generated content into existing files
- preserves manual edits outside generated blocks
- writes workspace and point outputs to different paths

Check:
- compares generated output with the current repo state
- surfaces stale files and drift
- runs before changes are considered complete

Together, they make generated context safe to maintain over time.

## Developer reading order

If you want to understand the codebase quickly, read in this order:
1. `agentctx.config.ts`
2. `packages/core/src/config.ts`
3. `packages/core/src/repoFileIndex.ts`
4. `packages/adapters/src/index.ts`
5. `packages/core/src/graph.ts`
6. `packages/core/src/contextBlocks.ts`
7. `packages/targets/src/index.ts`
8. `packages/cli/src/lib/build/build.ts`
9. `packages/cli/src/lib/sync/sync.ts`
10. `packages/dual-agent-runner/src/cli.ts`

That order matches the actual runtime flow.

Deferred cleanup:
- point directories and generated context blocks are the canonical terminology throughout the framework
- this rollout deliberately stops short of that schema/config break
