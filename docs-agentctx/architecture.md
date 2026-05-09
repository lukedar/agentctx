# Architecture

This page is the code schematic for AgentCtx.

Read it as the map of how the framework works:
- where the data enters
- how it is normalized
- how the compiler stages are separated
- why each package owns its own concern
- how the runtime stays deterministic

## Contents

- [Language of the framework](#language-of-the-framework)
- [Compiler model](#compiler-model)
- [Application flow](#application-flow)
- [Data contracts](#data-contracts)
- [Package boundaries](#package-boundaries)
- [Coding patterns](#coding-patterns)
- [Sync and validation](#sync-and-validation)
- [Developer reading order](#developer-reading-order)

## Language of the framework

<div class="docs-grid">
  <div class="docs-card docs-span-6">
    <h3>Context point</h3>
    <p>A directory boundary selected for scoped generation, such as <code>apps/api</code> or <code>packages/core</code>.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Context block</h3>
    <p>One thematic slice of generated context for that point, such as architecture, testing, or workflows.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Fact</h3>
    <p>A normalized signal extracted from repo metadata, such as a framework, route, script, or package relationship.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Graph</h3>
    <p>The compiled structural model built from facts. It captures packages, apps, dependencies, and scope-aware boundaries.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Target</h3>
    <p>A rendered output format such as <code>AGENTS.md</code>, <code>CLAUDE.md</code>, or <code>llms.txt</code>.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Drift</h3>
    <p>The difference between current repo state and the generated context that should exist for that state.</p>
  </div>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>How they relate</h3>
  <p>A point produces multiple context blocks. Each block references and summarizes the important files for one topic inside that point rather than embedding the whole directory.</p>
</div>

## Compiler model

<img src="/diagrams/application-flow.svg" alt="AgentCtx application flow diagram" />

AgentCtx is a compiler, not a crawler.

The repo is treated as an input graph and compiled into output artifacts.

The runtime is built as a deterministic compiler pipeline. For the execution order and term definitions, use the dedicated <a href="/pipeline">Pipeline</a> page.

## Application flow

### Application diagram

<img src="/diagrams/application-flow.svg" alt="AgentCtx application flow diagram" />

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

Each contract narrows the allowed shape of the data. That is how the framework avoids passing opaque objects across layers.

## Package boundaries

### `core`

`core` owns the deterministic compiler model.

Responsibilities:
- config normalization
- repo file indexing
- fact execution context
- graph compilation
- context-block planning

### `adapters`

`adapters` owns metadata extraction and framework detection.

Responsibilities:
- repo detectors
- framework adapters
- metadata-first fact extraction

### `targets`

`targets` owns presentation.

Responsibilities:
- render `AGENTS.md`
- render `CLAUDE.md`
- render editor and runtime target files
- format the shared context-block model

### `cli`

`cli` owns orchestration and mutation.

Responsibilities:
- resolve scope
- call the compiler pipeline
- write outputs
- sync generated files
- run drift checks

### `dual-agent-runner`

`dual-agent-runner` owns evaluation.

Responsibilities:
- run the repo quality gate
- score task progress
- write evaluation reports

## Coding patterns

### Deterministic first

The framework always prefers stable output over cleverness.

That means:
- sort inputs before rendering
- avoid timestamps
- avoid hidden side effects
- keep generated output explainable from repo state

### Metadata first

The framework prefers manifests and high-signal config over full source parsing.

That keeps the scan:
- cheaper
- easier to test
- easier to redact
- more stable across repos

### Shared model, many outputs

The same graph and context-block model feed every target.

That means:
- targets should not rescan the repo
- output differences should come from formatting only
- drift is easier to reason about because there is one compiler path

## Sync and validation

### Sync

Sync applies built outputs back into the repo.

Rules:
- preserve manual edits outside generated regions
- only write what changed
- keep workspace and point sync behavior aligned

### Validation

Validation checks:
- type safety
- tests
- build health
- generated output drift

The execution details live on the <a href="/pipeline">Pipeline</a> page and the repo gate details live on <a href="/quality-gate">Dual Agent Runner</a>.

## Developer reading order

1. `Pipeline`
2. `Architecture`
3. `Context Points`
4. `Config`
5. `CLI`
6. `Targets`
