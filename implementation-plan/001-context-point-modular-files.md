# AgentCtx Implementation Plan: Context-Point AGENTS.md + Modular Context Files

## Purpose

Update AgentCtx so every context point generates a lightweight `AGENTS.md` entrypoint plus a set of specialised Markdown context files.

This turns `AGENTS.md` into a routing and instruction file, while deeper operational knowledge is stored in modular, task-specific context slices.

The goal is to improve agent accuracy, token efficiency, monorepo scalability, drift detection precision, reviewability, incremental build performance, and context reuse across Claude, Codex, Cursor, Copilot, Windsurf, and future targets.

---

## Core Design Decision

Do not generate one huge `AGENTS.md` per context point.

Use this model instead:

```text
AGENTS.md = entrypoint, routing, critical rules
.agentctx/context/*.md = specialised operational knowledge
```

This gives agents a predictable starting file while allowing the compiler to expose only the context needed for the current task.

---

## Target Output Structure

### Root repo

```text
repo/
  AGENTS.md
  agentctx.config.ts

  .agentctx/
    graph.json
    facts.json
    cache/
    context/
      workspace.md
      mesh.md
      commands.md
      security.md
```

### Context point

```text
apps/frontend/
  AGENTS.md

  .agentctx/context/
    architecture.md
    conventions.md
    routes.md
    testing.md
    security.md
    dependencies.md
    commands.md
```

### Example polyglot monorepo

```text
repo/
  AGENTS.md

  apps/angular-web/
    AGENTS.md
    .agentctx/context/
      architecture.md
      conventions.md
      routes.md
      testing.md
      security.md

  services/dotnet-api/
    AGENTS.md
    .agentctx/context/
      architecture.md
      api.md
      database.md
      security.md
      testing.md

  services/node-worker/
    AGENTS.md
    .agentctx/context/
      architecture.md
      queues.md
      jobs.md
      testing.md
      security.md

  packages/shared-contracts/
    AGENTS.md
    .agentctx/context/
      schemas.md
      dependencies.md
      compatibility.md
```

---

## Root AGENTS.md Responsibilities

The root `AGENTS.md` should answer:

1. What is this repository?
2. What context points exist?
3. How are context points connected?
4. Which context point should an agent use for a given task?
5. What global commands are safe to run?
6. What global rules must always be respected?
7. Where are deeper context files located?

Example root `AGENTS.md` shape:

```md
# AgentCtx Workspace Instructions

## Repository Purpose

This repository contains a polyglot monorepo with multiple bounded systems.

## Context Points

| Context Point | Path | Purpose | Primary Stack |
|---|---|---|---|
| frontend | apps/angular-web | Customer web UI | Angular |
| api | services/dotnet-api | Backend API | .NET |
| worker | services/node-worker | Background jobs | Node.js |
| contracts | packages/shared-contracts | Shared schemas | TypeScript |

## Context Loading Rules

- For frontend tasks, start with `apps/angular-web/AGENTS.md`.
- For backend API tasks, start with `services/dotnet-api/AGENTS.md`.
- For schema or DTO changes, load `packages/shared-contracts/AGENTS.md` first.
- For cross-system changes, load `.agentctx/context/mesh.md`.

## Global Safety Rules

- Do not modify generated files outside `agentctx:start` and `agentctx:end` blocks.
- Do not run destructive commands.
- Prefer targeted tests over full workspace tests unless requested.
```

---

## Context-Point AGENTS.md Responsibilities

Each context point `AGENTS.md` should answer:

1. What does this context point do?
2. Which deeper files should an agent load?
3. What are the most important rules?
4. What are the safe commands?
5. What boundaries should not be crossed?
6. Which other context points are relevant?

Example:

```md
# Agent Instructions: frontend

## Purpose

This context point contains the Angular frontend application.

## Load Order

1. `.agentctx/context/architecture.md`
2. `.agentctx/context/conventions.md`
3. `.agentctx/context/routes.md`
4. `.agentctx/context/testing.md`
5. `.agentctx/context/security.md`

## Critical Rules

- Prefer Angular standalone components.
- Keep API contracts aligned with `packages/shared-contracts`.
- Do not duplicate DTO types locally.
- Use existing route guards for protected pages.

## Safe Commands

```bash
pnpm --filter frontend test
pnpm --filter frontend lint
pnpm --filter frontend build
```

## Related Context Points

- `api` for backend endpoint behavior.
- `contracts` for shared DTOs and schemas.
```

---

## Modular Context File Types

### Required for all context points

```text
architecture.md
conventions.md
commands.md
testing.md
security.md
dependencies.md
```

### Framework-specific optional files

Frontend:

```text
routes.md
components.md
state.md
styling.md
accessibility.md
```

Backend API:

```text
api.md
database.md
auth.md
middleware.md
errors.md
```

Worker or service:

```text
jobs.md
queues.md
scheduling.md
retries.md
observability.md
```

Shared package:

```text
schemas.md
exports.md
compatibility.md
versioning.md
```

Workspace/root:

```text
workspace.md
mesh.md
ownership.md
global-commands.md
release.md
```

---

## Config Update

Add `contextPoints` and `contextFiles` to `agentctx.config.ts`.

```ts
import { defineConfig } from "agentctx"

export default defineConfig({
  contextPoints: [
    {
      name: "frontend",
      path: "apps/angular-web",
      type: "app",
      framework: "angular",
      dependsOn: ["api", "contracts"],
      outputs: ["agents-md", "claude", "cursor"],
      contextFiles: [
        "architecture",
        "conventions",
        "routes",
        "testing",
        "security",
        "dependencies"
      ],
      budget: {
        agentsMd: 1200,
        contextPoint: 6000,
        total: 10000
      }
    },
    {
      name: "api",
      path: "services/dotnet-api",
      type: "service",
      framework: "dotnet",
      dependsOn: ["contracts"],
      outputs: ["agents-md", "claude"],
      contextFiles: [
        "architecture",
        "api",
        "database",
        "testing",
        "security",
        "dependencies"
      ]
    }
  ],

  rootContext: {
    files: ["workspace", "mesh", "commands", "security"]
  }
})
```

---

## Internal Data Model

Use facts and context slices, not Markdown-first generation.

```ts
export type ContextPoint = {
  readonly name: string
  readonly path: string
  readonly type: "app" | "service" | "package" | "tool" | "docs"
  readonly framework?: string
  readonly dependsOn: readonly string[]
  readonly outputs: readonly TargetName[]
  readonly contextFiles: readonly ContextSliceType[]
  readonly budget?: TokenBudget
}

export type ContextSliceType =
  | "architecture"
  | "conventions"
  | "commands"
  | "testing"
  | "security"
  | "dependencies"
  | "routes"
  | "api"
  | "database"
  | "auth"
  | "queues"
  | "schemas"
  | "mesh"
  | "workspace"

export type ContextSlice = {
  readonly pointName: string
  readonly type: ContextSliceType
  readonly outputPath: string
  readonly content: string
  readonly factsUsed: readonly string[]
  readonly hash: string
  readonly estimatedTokens: number
  readonly generatedAt: string
}

export type AgentEntrypoint = {
  readonly pointName: string
  readonly outputPath: string
  readonly loadOrder: readonly string[]
  readonly criticalRules: readonly string[]
  readonly safeCommands: readonly string[]
  readonly relatedPoints: readonly string[]
  readonly estimatedTokens: number
}
```

---

## Functional Pipeline

Keep the implementation functional and simple.

```ts
export const buildContextPoint = async (
  env: BuildEnv,
  point: ContextPoint
): Promise<BuildResult> => {
  const files = await scanContextPoint(env, point)
  const facts = await extractFacts(env, point, files)
  const graph = buildPointGraph(point, facts)
  const slices = await generateContextSlices(env, point, graph)
  const entrypoint = renderAgentEntrypoint(point, graph, slices)

  return persistBuildArtifacts(env, point, {
    facts,
    graph,
    slices,
    entrypoint
  })
}
```

Avoid hidden mutation. Prefer pure transformations:

```ts
const facts = extractFacts(files)
const graph = createGraph(facts)
const plan = createContextPlan(graph, budget)
const slices = renderSlices(plan)
```

---

## CLI Changes

### Build all points

```bash
agentctx build
```

Expected behavior:

```text
✔ Built root workspace context
✔ Built frontend context point
✔ Built api context point
✔ Built worker context point
✔ Generated root AGENTS.md
✔ Generated 3 context-point AGENTS.md files
✔ Generated 22 modular context files
```

### Build one point

```bash
agentctx build --point frontend
```

### Build changed points only

```bash
agentctx build --affected
```

Affected detection should use:

- git diff
- file hash cache
- context point path matching
- dependency graph impact

Example:

```text
Changed file:
packages/shared-contracts/src/user.ts

Affected context points:
- contracts
- frontend
- api
```

### Build one slice

```bash
agentctx build --point api --slice security
```

### Check staleness

```bash
agentctx check
agentctx check --point frontend
agentctx check --affected
```

### Sync

```bash
agentctx sync
agentctx sync --point frontend
agentctx sync --targets agents-md,cursor,claude
```

---

## Build Planning Algorithm

Add a build planner before generation.

```ts
export type BuildRequest = {
  readonly points?: readonly string[]
  readonly slices?: readonly ContextSliceType[]
  readonly affectedOnly: boolean
  readonly targets: readonly TargetName[]
}

export type BuildPlan = {
  readonly rootRequired: boolean
  readonly points: readonly PlannedPointBuild[]
}

export type PlannedPointBuild = {
  readonly point: ContextPoint
  readonly slices: readonly ContextSliceType[]
  readonly reason: "requested" | "changed" | "dependency" | "stale"
}
```

Planner steps:

1. Load config.
2. Load cache.
3. Detect changed files.
4. Map changed files to context points.
5. Expand affected graph using `dependsOn`.
6. Select required slices.
7. Skip unchanged slices by hash.
8. Generate deterministic build plan.
9. Emit plan to CLI and telemetry UI.

---

## Drift Detection

Drift should be slice-aware.

Instead of:

```text
AGENTS.md is stale
```

Prefer:

```text
Context drift detected in api

- api.md stale because 3 controller files changed
- security.md stale because auth middleware changed
- dependencies.md stale because package references changed
```

Drift result type:

```ts
export type DriftFinding = {
  readonly pointName: string
  readonly slice: ContextSliceType | "entrypoint"
  readonly severity: "info" | "warning" | "error"
  readonly reason: string
  readonly changedFiles: readonly string[]
  readonly recommendedCommand: string
}
```

---

## Token Budget Strategy

`AGENTS.md` files must stay small.

Recommended defaults:

```text
root AGENTS.md: 1,500 tokens max
context-point AGENTS.md: 1,200 tokens max
individual context slice: 2,000 tokens max
full context point budget: 8,000 tokens max
root mesh context: 3,000 tokens max
```

Agent 2 must score every generated output for:

- unnecessary repetition
- bloated summaries
- irrelevant facts
- missing load-order clarity
- token budget violations

---

## Security Rules

Generated context must never expose secrets.

Scanner must detect and redact:

- `.env`
- private keys
- connection strings
- tokens
- certificates
- passwords
- production URLs if configured as sensitive
- internal hostnames if configured as sensitive

Redaction example:

```md
DATABASE_URL=<redacted>
```

Security implementation:

```ts
export const redactSensitiveText = (input: string): string =>
  secretPatterns.reduce(
    (value, pattern) => value.replace(pattern, "<redacted>"),
    input
  )
```

Do not include raw `.env` values in context. Include only variable names.

---

## Manual Edit Protection

All synced generated files should use protected regions.

```md
<!-- agentctx:start generated=true -->
Generated content here.
<!-- agentctx:end -->

<!-- Human notes below this line are preserved. -->
```

Sync behavior:

1. If file does not exist, create it.
2. If file exists with markers, replace only generated region.
3. If file exists without markers, create backup or ask in interactive mode.
4. In CI mode, fail rather than overwrite ambiguous files.

---

## Target Adapter Behavior

Target adapters consume the same context slices differently.

### AGENTS.md

Entrypoint and routing.

### CLAUDE.md

Can include imports or references to relevant context files.

### Cursor rules

Generate smaller task and file-pattern-specific rules.

Example:

```text
.cursor/rules/frontend-angular.mdc
.cursor/rules/api-dotnet.mdc
.cursor/rules/shared-contracts.mdc
```

### Copilot instructions

Generate concise global instructions plus links to context point entrypoints.

### llms.txt

Expose public documentation-oriented context only.

Never include private security or internal operational details in public `llms.txt`.

---

## Dual-Agent Runner Requirements

This update must be implemented through the dual-agent pattern.

### Agent 1: Builder

Responsibilities:

- implement the feature
- modify code
- write tests
- update docs
- keep code simple and functional

### Agent 2: Evaluator

Scores every step against:

```text
performance
usability
code readability
security
token usage
correctness
distribution readiness
```

Agent 2 must reject changes if:

- `AGENTS.md` becomes bloated
- context slices duplicate each other heavily
- secrets could be exposed
- build planning is not deterministic
- changed-point detection is unreliable
- CLI output is unclear
- generated files are not diff-friendly

---

## Agent 2 Scoring Rubric

| Metric | Pass Standard |
|---|---|
| Performance | Incremental builds skip unchanged slices |
| Usability | CLI clearly explains what was built and why |
| Readability | Core logic is small, typed and testable |
| Security | Secrets are redacted and public outputs are filtered |
| Token Usage | Entrypoints are compact and slices are scoped |
| Correctness | Affected graph handles dependencies |
| Distribution | Works through npm, CI and local workflows |

Minimum release gate:

```text
overall score >= 8.5 / 10
no security score below 9 / 10
no correctness score below 8.5 / 10
```

---

## Test Plan

### Unit tests

- config parsing
- context point matching
- slice selection
- affected graph expansion
- manual marker replacement
- token budget enforcement
- secret redaction

### Integration tests

Fixture monorepo:

```text
fixtures/polyglot-monorepo/
  apps/angular-web/
  services/dotnet-api/
  services/node-worker/
  packages/shared-contracts/
```

Test cases:

1. `agentctx build` creates root and point-level files.
2. `agentctx build --point frontend` only builds frontend.
3. `agentctx build --affected` expands from contracts to frontend and api.
4. `agentctx build --point api --slice security` only regenerates API security context.
5. `agentctx sync` preserves manual edits.
6. `agentctx check` fails when slices are stale.
7. `llms.txt` excludes private security context.
8. `.env` values are never emitted.

---

## Documentation Updates

Add docs pages:

```text
docs/concepts/context-points.md
docs/concepts/context-slices.md
docs/concepts/context-mesh.md
docs/cli/build.md
docs/cli/sync.md
docs/security/redaction.md
docs/guides/polyglot-monorepo.md
```

Docs must explain:

- why `AGENTS.md` is an entrypoint, not a data dump
- how context slices improve token usage
- how context points map to real system boundaries
- how affected builds work
- how to review generated context in PRs

---

## Success Criteria

This update is successful when:

1. Large monorepos can generate context per bounded system.
2. Agents have a clear starting file for every context point.
3. Deeper context is modular and task-specific.
4. Incremental builds operate at slice level.
5. Drift detection points to exact stale slices.
6. Token usage is measurable and controlled.
7. Generated files are secure and reviewable.
8. The model scales beyond JS-only repositories.

---

## Implementation Order

### Phase 1: Data model

- Add context point schema.
- Add context slice types.
- Add entrypoint model.
- Add build plan model.

### Phase 2: Generator

- Implement root `AGENTS.md` renderer.
- Implement context-point `AGENTS.md` renderer.
- Implement modular slice renderers.
- Add token estimates.

### Phase 3: CLI

- Add `--point`.
- Add `--slice`.
- Add `--affected`.
- Add clear build output.

### Phase 4: Sync

- Add marker-based replacement.
- Preserve manual edits.
- Support point-level sync.

### Phase 5: Drift

- Add slice-aware drift detection.
- Add `check --point`.
- Add CI-friendly JSON output.

### Phase 6: Tests

- Add polyglot monorepo fixture.
- Add unit and integration tests.
- Add security redaction tests.

### Phase 7: Docs

- Add context point guide.
- Add monorepo guide.
- Add generated file examples.

---

## Final Product Principle

This feature should make AgentCtx feel like infrastructure, not a generator.

The best version is:

```text
root AGENTS.md tells agents where to go
context-point AGENTS.md tells agents what matters locally
context slices give agents only the depth they need
the context mesh explains how systems connect
```

That is the scalable model for autonomous engineering context.
