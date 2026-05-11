# Architecture

<div class="docs-hero">
  <span class="docs-kicker">Compiler architecture</span>
  <h1>A semantic context compiler for software systems.</h1>
  <p class="docs-lead">
    AgentCtx compiles repositories into operational context optimized for AI systems.
  </p>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Core principle</h3>
  <p>AgentCtx is designed for any repo, any framework, and any agent. The compiler stays framework-agnostic while adapters provide framework-specific evidence.</p>
</div>

## Compiler Model

```text
Source Code + Config + Docs
  -> File Index
  -> Evidence-backed Facts
  -> Context Graph
  -> Operational Context
  -> Context Surfaces
  -> AI Systems
```

For the reusable compiler stages, see [Compiler](/compiler).

## Concepts Overview

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Context Point</h3>
    <p>A bounded operational domain inside a repo: frontend, API, worker, shared contracts, database, or infra.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context Mesh</h3>
    <p>The dependency and communication graph between context points.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context Block</h3>
    <p>An <a href="/context-block">evidence-backed, task-aware, token-aware operational context unit</a>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context Surface</h3>
    <p>A rendered visibility-aware output for internal agents, public consumers, CI, or review systems.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context File</h3>
    <p>A focused Markdown file such as <code>security.md</code>, <code>routes.md</code>, or <code>commands.md</code>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Target</h3>
    <p>A delivery format such as <code>AGENTS.md</code>, <code>CLAUDE.md</code>, Cursor rules, Copilot instructions, or <code>llms.txt</code>.</p>
  </div>
</div>

## Concepts In Detail

### Context Point

A Context Point is a bounded operational domain inside a repository. It is the unit that lets AgentCtx avoid treating a monorepo as one large prompt.

Context Points matter because most engineering tasks are scoped. A frontend routing task should not require an agent to load database migrations, deployment rules, and worker retry policies unless the context mesh says those systems are involved.

### Context Mesh

The Context Mesh is the relationship model between Context Points. It captures dependency direction, shared contracts, runtime communication, and cross-system change rules.

Example:

```text
frontend -> api -> database
worker -> queue -> api
shared-contracts -> frontend, api, worker
```

The mesh helps agents reason about impact. If a shared schema changes, the relevant question is not only “where is this file used?” It is also “which operational domains consume this contract, and what validation path should change with it?”

### Context Block

A <a href="/context-block">Context Block</a> is the intermediate semantic unit: compact, evidence-backed, task-aware, token-aware, and visibility-aware operational context.

Blocks are not raw summaries. They express what matters for a kind of work: responsibilities, dependencies, invariants, failure modes, safe commands, and task affordances.

AgentCtx uses this model so context can be planned and governed before it is rendered into a specific surface.

### Context Surface

A Context Surface is the final rendered output that a consumer actually sees.

Internal surfaces can include local operational detail:

- `AGENTS.md`
- `CLAUDE.md`
- Cursor rules
- Copilot instructions

Public-safe surfaces exclude sensitive material:

- `llms.txt`
- future public manifests
- external docs-crawler outputs

This distinction is central to the architecture. A coding agent inside the repo and an external consumer should not receive the same context.

### Context File

A Context File is a focused Markdown file under `.agentctx/context/`.

Universal files such as `overview.md`, `security.md`, `boundaries.md`, and `commands.md` orient every agent. Capability files such as `routes.md`, `api.md`, `database.md`, `queues.md`, or `permissions.md` appear only when the repo has evidence for them.

The goal is task-aware loading. `AGENTS.md` should stay compact and tell the agent which deeper files to load for the work at hand.

### Target

A Target is a renderer for one delivery format. Targets format selected context; they do not rescan the repo or reinterpret framework evidence.

That boundary keeps the compiler stable. Adding a new target should be mostly presentation work. Adding support for a new framework should happen in adapters. Changing context policy should happen in core selection and visibility rules.

## Package Boundaries

- `core` owns config normalization, file indexing, fact models, graph compilation, context-file registry, and selection.
- `adapters` own framework and metadata extraction. They emit facts, evidence, confidence, and visibility signals, not Markdown.
- `targets` own presentation and context-surface rendering.
- `cli` owns orchestration, writes, sync, drift checks, `plan`, and `explain`.
- `dual-agent-runner` owns evaluation and step-gated implementation workflows.

## Why This Shape Matters

The architecture keeps repo understanding separate from presentation. A new framework adapter should not require a target rewrite. A new agent target should not rescan the repo. A new context surface should apply visibility policy instead of copying sensitive internal context into public outputs.

## Dual Agent Runner Principle

AgentCtx is developed with the Dual Agent Runner because context infrastructure changes how every downstream agent understands a repo. That kind of change needs a stricter workflow than “make the patch and hope the tests catch it.”

The runner turns development into a two-pass loop:

1. A builder makes a focused change.
2. An evaluator checks correctness, safety, readability, usability, token usage, and distribution readiness.
3. The work advances only after the current step passes the gate.

For senior engineering teams, the benefit is not ceremony. It is operational control:

- large changes are split into reviewable batches
- every batch leaves an auditable report
- context quality is evaluated before it becomes trusted by agents
- regressions stay local to the step that introduced them
- architectural decisions are checked against deterministic build, test, and typecheck gates

This mirrors the core AgentCtx philosophy: autonomous systems need compiled context, but teams also need visible evidence that the context compiler itself is changing safely.

## Performance Design

AgentCtx is designed for deterministic rendering, changed-file checks, token budgets, and future recipe-level caching. The long-term target is sub-second small-repo builds, fast medium-repo builds, and incremental-only workflows for large monorepos.

## Reading Order

1. [Why AgentCtx](/why-agentctx)
2. [Compiler](/compiler)
3. [Context Block](/context-block)
4. [Context Files](/context-files)
5. [Context Points](/context-points)
6. [Public-safe Context](/public-safe-context)
7. [CLI](/cli)
