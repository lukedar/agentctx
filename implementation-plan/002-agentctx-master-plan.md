# AgentCtx — Implementation Plan (from brief)

## 0) Current state (codebase analysis)
- Working directory: `/Users/lukedarham/Documents/apps/agentctx`
- Status: **implemented** runner-first monorepo + AgentCtx MVP.

### Progress snapshot
Done:
- `dual-agent-runner` core library (types, scoring incl tokenUsage, guardrails, prompts, task plan, reports) + tests
- `dual-agent-runner-ui` (SSE server + React dashboard)
- Runner VitePress docs + GitHub Pages workflow
- Runner architecture page with interactive SVG pipeline diagram (sequence button + per-step description)
- AgentCtx MVP: `@agentctx/core` (config loader, repo index, plugin runner, sections, minimal graph), `@agentctx/adapters` (MVP plugins), `@agentctx/targets` (MVP targets)
- AgentCtx docs: added a team-facing “Quality Gate (Dual-Agent Evaluation)” page documenting `pnpm da:eval`, report artifacts, and CI enforcement
- Local global install: `agentctx` installed via pnpm global bin (`/Users/lukedarham/Library/pnpm/agentctx`); ensure PATH includes `/Users/lukedarham/Library/pnpm` for testing in other repos
- `agentctx` CLI with commands: `init`, `build`, `sync`, `check`, plus caching (`--changed`) and generated-block-preserving sync

### Dual-agent execution (from AGENTCTX_DUAL_AGENT_EXECUTION_PLAN.md)
AgentCtx development is governed by a strict **Builder (Agent 1) → Evaluator (Agent 2)** operating model.

Core thesis to preserve:
- AgentCtx is **context infrastructure**: repo → context points → context graph → compilation → target artifacts → integrity checks.
- The product is **reliable context architecture**, not “Markdown generation”.

Mandatory evaluation dimensions (Evaluator):
- correctness, performance, token usage, security, usability, readability, testability
- blocking conditions (examples): security regressions, unsafe filesystem writes, non-determinism, uncontrolled shell execution

How we enforce this today in-repo:
- Local gate: `pnpm da:eval` (runs typecheck/test/build and writes `.dual-agent-runner/reports/dev-eval.md`)
- CI gate: `.github/workflows/dual-agent-gate.yml` runs the same command on PRs/pushes

### What we will do in 5 steps (for every future development task)
1) **Task intake + constraints**: define goal, scope boundaries (workspace vs context points), success criteria, and security/token constraints.
2) **Builder proposes approach**: smallest change set, deterministic outputs, root-safe writes, minimal dependencies.
3) **Builder implements + verifies**: implement, then run the deterministic checks (at minimum `pnpm da:eval`).
4) **Evaluator scores + gates**: review results + artifacts, score against rubric; block until issues are fixed.
5) **Ship artifacts + traceability**: commit-ready summary, keep reports available (CI logs/artifacts), update docs when behaviour changes.

Post-MVP/deferred:
- GitHub Action + AgentCtx docs/demo site
- Input brief: `/Users/lukedarham/Desktop/AGENTCTX_IMPLEMENTATION_BRIEF.md` (local-first JS/TS “context compiler” CLI; monorepo; deterministic generated Markdown outputs; security redaction; incremental caching; publish via npm).

Implication: the project needs to be scaffolded from scratch before any feature work.

---

## 1) Goal / Outcome
Deliver an **excellent, publishable npm CLI** (`agentctx`) that:
- Provides commands: `init`, `build`, `sync`, `check` (MVP). (`watch` can follow after MVP.)
- Generates deterministic, reviewable context outputs (AGENTS.md, CLAUDE.md, Cursor rules, Copilot instructions, llms.txt).
- Is local-first (no code exfiltration, no login) and secure by default (redaction + ignores).
- Scales via incremental builds and caching.

Primary distribution UX:
```bash
npx agentctx init
npx agentctx build
npx agentctx sync --targets claude,cursor,copilot,llms
npx agentctx check
```

---

## 1.1) Runner-first strategy (revised approach)
We will **build `dual-agent-runner` first**, as a reusable, decoupled framework Copilot can use to run *any* engineering task with a Builder/Evaluator loop.

Then we will build AgentCtx (compiler + CLI) **using the runner’s artifacts**:
- Builder/Evaluator role prompts
- Decision Record + Evaluation formats
- Scoring rules (including token usage)
- Guardrails (security/perf/token)
- Markdown reporting

This is a deliberate dogfooding step: AgentCtx is the first “real” workload executed under the dual-agent framework.

---

## 2) Guiding constraints (from brief)
- **Determinism**: stable ordering; no timestamps/random ids in generated output by default.
- **Local-first + secure**: ignore `.env*`, keys, private files; never include secret values; redact suspicious tokens.
- **Functional core**: pure-ish functions, explicit inputs/outputs; avoid magic classes.
- **Performance**: prefer metadata/config files; avoid dumping full source; incremental builds for larger repos.
- **Professional tooling bar**: TS strict; ESM-first; tests + snapshot fixtures; helpful CLI UX; JSON output option.

---

## 3) Proposed repository architecture
### 3.1 Monorepo layout (matches brief)
```
agentctx/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  packages/
    dual-agent-runner/     # reusable dual-agent runner framework (builder/evaluator loop)
    dual-agent-runner-ui/  # local-first dashboard + server for runner events/metrics
    core/       # compiler pipeline, types, config, scanner, graph, planner, security, cache
    cli/        # user-facing CLI commands and UX
    adapters/   # fact extraction plugins (frameworks/tools)
    targets/    # output targets (AGENTS.md, CLAUDE.md, Cursor, Copilot, llms)
    action/     # GitHub Action wrapper (post-MVP if needed)
  docs/         # docs site (post-MVP)
```

### 3.2 Tech decisions (recommended defaults)
- Package manager: **pnpm workspace**
- Runtime: **Node 20+**
- Language: **TypeScript (strict)**
- Output: **ESM-only** (confirmed for the first publish; revisit CJS later if needed)
- Libraries (from brief): `fast-glob`, `picomatch`, `pathe`, `zod`, `picocolors` (or `kleur`), `fs-extra` (or native `fs/promises`).
- CLI framework: **`cac` or `commander`** (pick one; `cac` tends to be lean and pleasant).
- Tests: **Vitest** + snapshot tests with fixtures.

---

## 3.3) Dual-agent runner framework (new requirement)
Add a **fully decoupled** package under `packages/dual-agent-runner` (npm name: `dual-agent-runner`) that implements the reusable “Builder + Evaluator” loop described in:
- `/Users/lukedarham/Downloads/AGENTCTX_DUAL_AGENT_RUNNER_PLAN_V2.md` (authoritative)

Key outputs of `packages/dual-agent-runner` (library, not a CLI):
- `RunnerTask`, `DecisionRecord`, `EvaluationResult`, `ReviewScore` (immutable readonly types)
- Scoring + status logic (`pass`/`revise`/`fail`) with required dimensions:
  - `performance`, `tokenUsage`, `usability`, `readability`, `security`, `simplicity`, `maintainability`
  - rules: any <3 => fail; avg <4 => revise; **security <4 => revise**; **tokenUsage <4 => revise**
- Guardrails utilities/constants:
  - secret patterns + sensitive-value redaction
  - ignore dirs/files guidance
  - performance evaluator “must reject” list
  - token usage guardrails (budgets, estimator, metrics)
- Prompt templates for Builder and Evaluator roles (Copilot-friendly)
- Task planning helpers (`taskPlan.ts`) so tasks can be broken into small reviewed steps
- Markdown report generation (Decision Records + Reviews + final summary)
- Deterministic tests for scoring/guards/token-metrics/report output

Optional (V2): event-driven observability + local UI.
- We will model this as **separate packages** so the core runner stays reusable and small:
  - `packages/dual-agent-runner` (core library)
  - `packages/dual-agent-runner-ui` (optional React UI + local server)

Important: **no coupling** to `agentctx` domain types. The CLI and compiler do not import runtime logic from the runner unless we explicitly choose to later.

---

## 4) Domain model & core pipeline (MVP)
### 4.1 Core types (align with brief)
- `Result<T, E>`
- `AgentCtxConfig` (`targets`, `include`, `exclude`, `context`, `budgets`, `drift`, `security`, `rootDir`)
- Facts model (`Fact`, `FactKind`)
- `ContextGraph` normalized model
- `AgentCtxPlugin` for adapters: `detect()` + `extract()`
- `TargetAdapter` for outputs: `render()` -> `ContextFile[]`

### 4.2 Compiler pipeline (functional)
1. `loadConfig(rootDir)` (config validation via Zod)
2. `createRepoFileIndex(config)` (fast-glob + stable sorting + hashing)
3. `extractFacts({files, plugins})`
4. `redactUnsafeFacts(facts, securityConfig)`
5. `buildGraph(facts, config)`
6. `planSections(graph, config.context)` (produce section models)
7. `renderSections(sections, budgets)` (fit-to-budget)
8. `renderTargets({graph, sections, targets})` -> `.agentctx/out/*`
9. `writeOutputs()` -> `.agentctx/context/*.md` and `.agentctx/out/*`
10. `metrics` (token estimates + duration)

---

## 5) CLI commands (MVP)
### 5.1 `agentctx init`
- Detect repo root, package manager, frameworks/test tools, workspace structure.
- Write `agentctx.config.ts` (or update if exists with safe merge).
- Optionally run `build` and/or `sync` (`--yes` non-interactive).

### 5.2 `agentctx build`
- Full or incremental scan (`--changed`)
- Writes:
  - `.agentctx/context/*.md` (intermediate layered context)
  - `.agentctx/out/*` (target-ready artifacts)
- Supports `--json`, `--dry-run`, `--target`, `--focus` (focus can be a future enhancement; start with `--context` selection if needed).

### 5.3 `agentctx sync`
- Copies from `.agentctx/out/` into repo locations:
  - `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`, `.windsurf/rules/*`, `llms*.txt` (subset for MVP)
- Must **preserve manual edits** outside `<!-- agentctx:start -->` / `<!-- agentctx:end -->` blocks.
- Supports `--targets`, `--check`, `--dry-run`, `--json`, `--ci`.

### 5.4 `agentctx check`
- Validates:
  - config validity
  - drift threshold (compare previous facts vs current)
  - secret-risk (redaction warnings, unsafe config)
  - stale generated outputs (sync check)
  - protected blocks not edited
- Exits non-zero when configured to fail in CI.

---

## 6) Scanner + adapters (MVP)
### 6.1 Scanner rules
- Prefer high-value metadata/config/docs (package.json, tsconfig, vite/next/angular configs, test configs, README/docs) and limited route conventions.
- Default ignores: `node_modules`, build outputs, `.git`, lockfiles, `.env*`, private keys.
- Stable ordering of files and facts.

### 6.2 Adapters (plugins)
Implement as small pure detectors/extractors producing Facts:
- Package manager (pnpm/yarn/npm)
- Workspace detection
- Language: JS/TS
- Frameworks: React, Next.js, Angular, Vite
- Runtime/service hints: Node
- Tests: Vitest/Jest/Playwright/Cypress
- Minimal .NET detection (presence of `.csproj` / solution files)

---

## 7) Section planning & rendering (MVP)
Sections per config: `architecture`, `conventions`, `api`, `database`, `frontend`, `testing`, `workflows`, `glossary`.

For each section:
- `ContextSectionModel`: `{ summary, rules, workflows, files, warnings }`
- Rendered section -> markdown (deterministic ordering, consistent headings)
- Budgeting: token estimator (`len/4`), `fitToBudget()` by priority.

---

## 8) Targets (MVP)
Implement target adapters:
- `agents-md` -> `AGENTS.md`
- `claude` -> `CLAUDE.md`
- `cursor` -> `.cursor/rules/*.mdc` (at least one project-wide rule file)
- `copilot` -> `.github/copilot-instructions.md`
- `llms` -> `llms.txt` (and optionally `llms-full.txt` later)

All targets should use a shared helper to render generated blocks.

---

## 9) Security & redaction
- Never include `.env` values or lockfile contents.
- Redact suspicious secrets using regex patterns (OpenAI/Slack/GitHub tokens, private keys, etc.).
- Env vars: allow names, never values.
- Provide warnings in `check` when config allows risky output (e.g., source snippets).

---

## 10) Incremental builds & caching
- Cache location:
  - `.agentctx/cache/index.json`
  - `.agentctx/cache/facts.json`
  - `.agentctx/cache/sections.json`
- Cache invalidation rules (config change -> full rebuild; package.json/tsconfig/routes/test config -> targeted invalidation).
- Implement stable file hashing and changed-file detection.

---

## 11) Testing strategy
- Unit tests for pure functions:
  - config parsing/validation
  - file indexing + ignore rules
  - redaction
  - drift calculation
  - generated block merge algorithm
- Fixture-based snapshot tests:
  - `fixtures/next-app`, `fixtures/angular-app`, `fixtures/react-vite-app`, `fixtures/node-api`, `fixtures/dotnet-api`, `fixtures/pnpm-monorepo`.
- Snapshot: deterministic `AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot instructions, llms.txt.

---

## 12) Packaging & release (npm)
- Publish `agentctx` as the user-facing package (with `bin: { agentctx: ... }`).
- Optionally also publish scoped libs (`@agentctx/core`, `@agentctx/cli`, etc.) once stable.
- Ensure `npx agentctx` works:
  - compiled JS in `dist/`
  - correct shebang for CLI entry
  - ESM compatibility decisions documented.
- Add release workflow later (Changesets recommended) + semantic versioning.

---

## 13) Post-MVP (nice-to-have, but in brief)
- `agentctx watch` (fast rebuild loop; optional `--sync`).
- GitHub Action package (`packages/action`) + example workflow.
- Docs site + playground (keep light).
- AST-aware or import-graph-aware source analysis for deeper code intelligence when metadata-only scanning is not enough.
- `--affected` workflows that expand point selection through `dependsOn` relationships for build/check/sync.
- Full deferred list: [Future Enhancements](./004-future-enhancements.md).

---

## 14) Milestone plan (execution order)
Revised approach: **runner first**, then AgentCtx.

### Phase A — Build `dual-agent-runner` (reusable framework)
1. Bootstrap monorepo + build/test tooling (pnpm + TS strict + ESM-only)
2. Implement `packages/dual-agent-runner` core library:
   - types (incl. `tokenUsage` dimension)
   - scoring + acceptance rules
   - security/perf/token guardrails
   - token budgets + token usage metrics helpers
   - prompts (Builder/Evaluator)
   - task plan helpers
   - markdown reporting
   - tests (deterministic)
3. Implement `packages/dual-agent-runner-ui` (V2, selected):
   - append-only runner events + reducer-based UI model
   - local-first server (SSE) + React dashboard
   - tests for reducers/formatting
4. Add a simple docs site for `dual-agent-runner` (adoption-focused):
   - explain the Builder/Evaluator loop and scoring rubric (incl. tokenUsage)
   - show copy/paste prompts for Copilot
   - document guardrails (security/perf/token) aimed at senior dev teams
   - document the UI dashboard usage + what metrics mean
   - keep design minimal, fast, and aligned with AgentCtx CLI (same tone/visual system)

### Phase B — Build AgentCtx (compiler + CLI) using the dual-agent process
4. Define AgentCtx core types + errors (`@agentctx/core`)
5. Config loader + validation (`agentctx.config.ts` + `defineConfig`)
6. Repo file index (include/exclude + stable hashing)
7. Plugin interface + plugin runner
8. MVP adapters (package manager, JS/TS, frameworks, tests, dotnet basic)
9. Facts graph builder
10. Section planning + renderers + token budgets
11. Target adapters (AGENTS.md, CLAUDE.md, Cursor, Copilot, llms)
12. Sync with generated blocks (preserve manual edits)
13. Drift detection + `check`
14. Cache + `--changed`
15. Tests + fixtures + snapshots
16. GitHub Action + docs/demo (post-MVP)

---

## 15) Open questions / decisions needed
1. Package manager: **pnpm workspace** (confirmed)
2. Packaging: **ESM-only** (confirmed for the first publish)
3. AgentCtx MVP scope: **init/build/sync/check** (confirmed)
4. Runner package publishing: **unscoped `dual-agent-runner`** (confirmed)
5. Runner UI: **build in Phase A** (confirmed)
6. Runner UI transport: **SSE** (confirmed)
7. Runner docs site stack: **VitePress** (confirmed)

(We can proceed with sensible defaults if you want to move fast.)

---

## 16) Adoption plan — Quantifeed monorepo (context points + config)

Repo analysed: `/Users/lukedarham/Documents/apps/Quantifeed/`

### What the repo looks like (important boundaries)
- Predominantly **.NET** monorepo
- Root-level areas:
  - `Source/` (main code)
  - `Documentation/` ("Quantifeed Documentation Service"; dotnet build/run, uses Node/pnpm + python tooling)
  - `Tools/` (includes `Tools/Python/requirements.txt`)
- Inside `Source/` the clear system boundaries are:
  - `Apps/` (e.g. `WebApp`, `MockClientApisApp`)
  - `Services/` (many independently versioned/built services: ApiGateway, Identity, MarketData, Pricing, Trading, Reporting, etc.)
  - `Shared/` (shared libraries/types/proxies; very large)
  - `Database/` (many db solutions grouped by domain: Auth/Payment/Reporting/...)
  - plus `AcceptanceTests/`, `Tools/`, `Docker/`, `ConfigSchema/`, `Certs/`

### Context point philosophy for Quantifeed
Goal: maximize agent usefulness by aligning context points to **deployment + ownership boundaries**, while keeping builds fast.

- **Workspace scope** should remain small and cross-cutting (global build + standards + topology).
- **Context point scopes** should map to what engineers actually change:
  - Shared libs
  - Web app
  - Each major service
  - Database per domain area (Auth/Reporting/Payment/Profile/Services/Settings)
  - Documentation systems
  - Tools (dotnet + python) and acceptance tests

This lets agents run `agentctx build --point <name>` and get a tight, relevant context for the sub-system they are working on.

### Proposed context points (high value)
Core points (start here):
- `shared` → `Source/Shared`
- `webapp` → `Source/Apps/WebApp`
- `apigateway` → `Source/Services/ApiGateway`
- `identity` → `Source/Services/Identity`
- `marketdata` → `Source/Services/MarketData`
- `pricing` → `Source/Services/Pricing`
- `trading` → `Source/Services/Trading`
- `reporting` → `Source/Services/Reporting`

Support points (still valuable, but optional to build frequently):
- `notification` → `Source/Services/Notification`
- `payment` → `Source/Services/Payment`
- `approval` → `Source/Services/Approval`
- `profile` → `Source/Services/Profile`
- `settings` → `Source/Services/Settings`
- `monitoring` → `Source/Services/Monitoring`
- `validation` → `Source/Services/Validation`

Database points (domain split; enables targeted DB work):
- `db-auth` → `Source/Database/Auth`
- `db-services` → `Source/Database/Services`
- `db-reporting` → `Source/Database/Reporting`
- `db-payment` → `Source/Database/Payment`
- `db-profile` → `Source/Database/Profile`
- `db-settings` → `Source/Database/Settings`

Docs + tooling:
- `docs-service` → `Documentation`
- `docs-site` → `Source/Documentation`
- `tools-dotnet` → `Source/Tools`
- `tools-python` → `Tools/Python`
- `acceptance-tests` → `Source/AcceptanceTests`

### Draft agentctx.config.ts (to create at Quantifeed repo root)
Notes:
- Default AgentCtx includes/excludes are JS-centric; Quantifeed needs .NET-centric include/exclude.
- Workspace include is intentionally narrow for performance.
- Point includes pull in `Source/Directory.*.props` + `Source/NuGet.Config` (cross-cutting build inputs).

```ts
export default {
  workspace: {
    name: 'Quantifeed',
    root: '.',
    packageManager: 'unknown',
  },

  targets: ['agents-md', 'claude', 'cursor', 'copilot', 'llms'],

  // Keep workspace scan small: cross-cutting build + repo topology.
  include: [
    'global.json',
    '.github/copilot-instructions.md',

    'Source/Directory.Build.props',
    'Source/Directory.Packages.props',
    'Source/NuGet.Config',
    'Source/stylecop.json',
    'Source/.editorconfig',

    'Documentation/README.md',
    'Source/Documentation/README.md',

    // minimal inventory of boundaries
    'Source/Apps/**/.*',
    'Source/Apps/**/README.md',
    'Source/Services/**/.*',
    'Source/Services/**/README.md',
    'Source/**/Quantifeed.*.sln',
  ],

  exclude: [
    '.git/**',
    '$tf/**',
    'Data/**',

    // .NET build outputs
    '**/bin/**',
    '**/obj/**',

    // secrets/certs
    'Source/Certs/**',
    '**/*.pfx',
    '**/*.p12',
    '**/*.snk',
    '**/*.pem',
    '**/*.key',

    // appsettings often contain env-specific or sensitive values
    '**/appsettings.*.json',
    '**/secrets.*',

    // generic
    '**/.env*',
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
  ],

  budgets: {
    default: 'large',
    small: 4_000,
    medium: 12_000,
    large: 32_000,
  },

  drift: {
    failOnCheck: true,
    thresholdPercent: 10,
  },

  security: {
    redactSecrets: true,
    includeEnvValues: false,
    allowSourceSnippets: false,
  },

  contextPoints: [
    // Shared + apps
    {
      name: 'shared',
      path: 'Source/Shared',
      type: 'package',
      frameworks: ['dotnet'],
      budget: 'large',
      dependsOn: [],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Shared/**'],
    },
    {
      name: 'webapp',
      path: 'Source/Apps/WebApp',
      type: 'frontend',
      frameworks: ['dotnet'],
      budget: 'large',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Apps/WebApp/**'],
    },

    // Core services
    {
      name: 'apigateway',
      path: 'Source/Services/ApiGateway',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'large',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/ApiGateway/**'],
    },
    {
      name: 'identity',
      path: 'Source/Services/Identity',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'large',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Identity/**'],
    },
    {
      name: 'marketdata',
      path: 'Source/Services/MarketData',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'large',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/MarketData/**'],
    },
    {
      name: 'pricing',
      path: 'Source/Services/Pricing',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'large',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Pricing/**'],
    },
    {
      name: 'trading',
      path: 'Source/Services/Trading',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'large',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Trading/**'],
    },
    {
      name: 'reporting',
      path: 'Source/Services/Reporting',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'large',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Reporting/**'],
    },

    // Support services (medium by default)
    {
      name: 'notification',
      path: 'Source/Services/Notification',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'medium',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Notification/**'],
    },
    {
      name: 'payment',
      path: 'Source/Services/Payment',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'medium',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Payment/**'],
    },
    {
      name: 'approval',
      path: 'Source/Services/Approval',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'medium',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Approval/**'],
    },
    {
      name: 'profile',
      path: 'Source/Services/Profile',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'medium',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Profile/**'],
    },
    {
      name: 'settings',
      path: 'Source/Services/Settings',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'medium',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Settings/**'],
    },
    {
      name: 'monitoring',
      path: 'Source/Services/Monitoring',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'small',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Monitoring/**'],
    },
    {
      name: 'validation',
      path: 'Source/Services/Validation',
      type: 'backend',
      frameworks: ['dotnet'],
      budget: 'small',
      dependsOn: ['shared'],
      include: ['Source/Directory.Build.props', 'Source/Directory.Packages.props', 'Source/NuGet.Config', 'Source/Services/Validation/**'],
    },

    // Databases (split by domain)
    {
      name: 'db-auth',
      path: 'Source/Database/Auth',
      type: 'backend',
      frameworks: ['sql', 'dotnet'],
      budget: 'small',
      dependsOn: [],
      include: ['Source/Database/Auth/**'],
    },
    {
      name: 'db-services',
      path: 'Source/Database/Services',
      type: 'backend',
      frameworks: ['sql', 'dotnet'],
      budget: 'small',
      dependsOn: [],
      include: ['Source/Database/Services/**'],
    },
    {
      name: 'db-reporting',
      path: 'Source/Database/Reporting',
      type: 'backend',
      frameworks: ['sql', 'dotnet'],
      budget: 'small',
      dependsOn: [],
      include: ['Source/Database/Reporting/**'],
    },
    {
      name: 'db-payment',
      path: 'Source/Database/Payment',
      type: 'backend',
      frameworks: ['sql', 'dotnet'],
      budget: 'small',
      dependsOn: [],
      include: ['Source/Database/Payment/**'],
    },
    {
      name: 'db-profile',
      path: 'Source/Database/Profile',
      type: 'backend',
      frameworks: ['sql', 'dotnet'],
      budget: 'small',
      dependsOn: [],
      include: ['Source/Database/Profile/**'],
    },
    {
      name: 'db-settings',
      path: 'Source/Database/Settings',
      type: 'backend',
      frameworks: ['sql', 'dotnet'],
      budget: 'small',
      dependsOn: [],
      include: ['Source/Database/Settings/**'],
    },

    // Docs + tools
    {
      name: 'docs-service',
      path: 'Documentation',
      type: 'docs',
      frameworks: ['dotnet', 'node'],
      budget: 'medium',
      dependsOn: [],
      include: ['Documentation/**', 'Tools/Python/requirements.txt'],
    },
    {
      name: 'docs-site',
      path: 'Source/Documentation',
      type: 'docs',
      frameworks: ['docusaurus', 'node'],
      budget: 'medium',
      dependsOn: [],
      include: ['Source/Documentation/**'],
    },
    {
      name: 'tools-dotnet',
      path: 'Source/Tools',
      type: 'unknown',
      frameworks: ['dotnet'],
      budget: 'small',
      dependsOn: ['shared'],
      include: ['Source/Tools/**'],
    },
    {
      name: 'tools-python',
      path: 'Tools/Python',
      type: 'unknown',
      frameworks: ['python'],
      budget: 'small',
      dependsOn: [],
      include: ['Tools/Python/**'],
    },
    {
      name: 'acceptance-tests',
      path: 'Source/AcceptanceTests',
      type: 'unknown',
      frameworks: ['dotnet'],
      budget: 'small',
      dependsOn: ['shared'],
      include: ['Source/AcceptanceTests/**'],
    },
  ],
}
```

### Execution steps (once config exists)
1) From Quantifeed root: `agentctx build` (workspace + all points).
2) Start by syncing only workspace outputs: `agentctx sync`.
3) Then, for a team working in one area: `agentctx build --point identity && agentctx sync --point identity`.
4) Add/adjust dependsOn + budgets as you learn what each team actually needs.

### Notes / caveats
- Current AgentCtx adapters are JS/TS-focused; Quantifeed is .NET-heavy. The *structure* (context points + deterministic outputs) is still valuable now, but we’ll get much higher context quality once we add .NET-specific adapters (sln/csproj parsing, appsettings key extraction, etc.).
