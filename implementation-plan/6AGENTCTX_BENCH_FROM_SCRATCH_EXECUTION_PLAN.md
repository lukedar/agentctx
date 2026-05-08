# AgentCtx Bench: Full Implementation Plan from Scratch

## Purpose

Build `AgentCtx Bench`, a local-first testing and benchmarking framework that proves whether AgentCtx improves AI coding-agent outcomes.

AgentCtx Bench compares agent performance across different context conditions, such as:

- no generated context
- AgentCtx generated context
- full repo context
- manually curated context
- single-agent execution
- dual-agent execution

The framework must produce evidence that is useful to experienced engineering teams:

- Did the task succeed?
- Did tests pass?
- Did the agent touch the right files?
- Did it avoid unsafe changes?
- Did AgentCtx reduce token usage?
- Did AgentCtx improve time-to-success?
- Did structured context improve quality?
- Did dual-agent review justify its token and runtime cost?

---

## Core Product Principle

AgentCtx Bench must be evidence-first, not marketing-first.

The strongest claim is not:

```text
AgentCtx is better.
```

The strongest claim is:

```text
On this repo, for this task, using this agent, AgentCtx improved or worsened these measurable outcomes.
```

---

## Architecture Summary

Use a framework-agnostic core with framework-aware adapters.

```text
bench-core
  task loading
  condition execution
  workspace isolation
  diff capture
  token metrics
  security checks
  report model

bench-adapters
  angular scorer
  dotnet scorer
  react scorer
  node scorer
  worker scorer
  database scorer
  infra scorer

bench-reports
  markdown
  json
  html
  telemetry

bench-fixtures
  realistic benchmark projects
  reusable tasks
```

The core must not know Angular, .NET, React, Node, or any framework details.

Adapters know how to evaluate framework-specific outputs, but all adapters return the same normalised evidence model.

---

## Normalised Evidence Model

Every framework scorer must return this shape:

```ts
export type NormalisedEvidence = {
  readonly adapterName: string
  readonly contextPoint: string
  readonly capability: BenchCapability

  readonly testsPassed: boolean
  readonly buildPassed: boolean
  readonly lintPassed?: boolean
  readonly typecheckPassed?: boolean

  readonly expectedFilesChanged: readonly string[]
  readonly forbiddenFilesChanged: readonly string[]

  readonly securityFindings: readonly SecurityFinding[]
  readonly performance: PerformanceEvidence
  readonly tokenUsage: TokenUsageEvidence

  readonly notes: readonly string[]
}
```

This lets Angular, .NET, Node, workers, databases, and infra report different checks while still producing a unified benchmark report.

---

## Key Concepts

### Benchmark Task

A user-facing task an agent must complete.

Example:

```text
Add displayName to the user profile flow.
```

### Condition

The context mode used for the agent run.

Examples:

```text
no-context
agentctx-context
full-repo-context
manual-context
dual-agent-agentctx-context
```

### Fixture

A realistic repo or monorepo used for benchmark execution.

### Scorer

A module that evaluates evidence.

Examples:

```text
diff scorer
token scorer
security scorer
Angular scorer
.NET scorer
worker scorer
```

### Report

The final evidence output.

Formats:

```text
json
markdown
html
ndjson telemetry
```

---

## Target CLI

```bash
agentctx bench init
agentctx bench plan
agentctx bench run
agentctx bench run --task add-user-display-name
agentctx bench run --suite polyglot
agentctx bench run --conditions no-context,agentctx-context
agentctx bench compare
agentctx bench report
agentctx bench report --html
agentctx bench explain --run latest
agentctx bench baseline create
agentctx bench baseline compare
```

Performance-focused commands:

```bash
agentctx bench run --quick
agentctx bench run --affected
agentctx bench run --workers 6
agentctx bench run --reuse-fixtures
agentctx bench run --skip-unchanged
```

Research/debug commands:

```bash
agentctx bench run --research
agentctx bench trace --run latest
agentctx bench tokens --run latest
agentctx bench explain-context --task add-user-display-name
```

---

## Recommended Test Stack

```text
Runtime:        Node.js 22+
Language:       TypeScript strict mode
Package mgr:    pnpm workspaces
Unit tests:     Vitest
E2E/UI tests:   Playwright
Schema checks:  Zod
File watching:  Chokidar
Logging:        Pino / NDJSON
CLI:            cac
Terminal UI:    Ink
HTML reports:   Vite + React
Parallelism:    worker_threads
Storage:        JSON first, SQLite later
```

Use JSON files first for portability. Add SQLite later for long-term history, trend analysis, and larger benchmark datasets.

---

## Repository Structure

```text
packages/
  bench-core/
    src/
      task/
      suite/
      condition/
      workspace/
      runner/
      scoring/
      tokens/
      security/
      report/
      telemetry/

  bench-adapters/
    src/
      angular/
      dotnet/
      react/
      node/
      worker/
      database/
      infra/

  bench-cli/
    src/
      commands/

  bench-ui/
    src/
      terminal/
      html-report/

  bench-fixtures/
    fixtures/
      angular-dotnet-monorepo/
      react-node-monorepo/
      worker-queue-system/

  bench-examples/
    tasks/
```

---

## Execution Pipeline

```text
1. Load suite
2. Validate task definitions
3. Detect capabilities
4. Build execution plan
5. Fingerprint task, fixture, config, context
6. Skip unchanged runs where possible
7. Create isolated workspace
8. Prepare context condition
9. Run agent adapter
10. Capture diff, logs, duration, tokens
11. Run hard scorers
12. Run framework-aware scorers
13. Run security scorers
14. Aggregate evidence
15. Compare conditions
16. Generate reports
17. Emit telemetry
```

---

## Performance Architecture

### 1. Fingerprint Everything

Create stable hashes for:

```text
task.md
expected.md
scoring.config.ts
fixture files
agentctx context files
agent adapter config
benchmark config
```

Type:

```ts
export type BenchFingerprint = {
  readonly taskHash: string
  readonly expectedHash: string
  readonly scoringConfigHash: string
  readonly fixtureHash: string
  readonly contextHash: string
  readonly adapterHash: string
}
```

Expected outcome:

```text
Unchanged tasks are skipped automatically.
```

---

### 2. Isolated Workspaces

Each condition must run in an isolated temp workspace.

```text
.agentctx/bench-runs/
  run_123/
    no-context/
    agentctx-context/
    full-repo-context/
```

Expected outcome:

```text
Conditions cannot contaminate each other.
User working tree is not modified.
Runs are reproducible.
```

---

### 3. Fixture Snapshotting

Avoid expensive full copies.

Preferred order:

```text
copy-on-write if available
hard links where safe
shallow copy fallback
```

Expected outcome:

```text
Medium fixtures can be prepared quickly.
Large fixtures do not make benchmarks unusable.
```

---

### 4. Parallel Conditions

Run independent conditions in parallel.

```bash
agentctx bench run --workers 4
```

Expected outcome:

```text
no-context and agentctx-context run concurrently when safe.
Scoring workers do not block execution workers.
```

---

### 5. Hard Signals First

Run cheap objective checks before expensive review.

Order:

```text
exit code
diff checks
forbidden files
tests
build
security scan
framework-aware scoring
optional evaluator review
```

Expected outcome:

```text
Failed runs exit early unless --research is enabled.
```

---

### 6. Lazy Context Loading

Only load context relevant to the task.

Example for Angular profile task:

```text
AGENTS.md
overview.md
boundaries.md
routes.md
api-client.md
testing.md
security.md
```

Do not load:

```text
queues.md
deployments.md
database.md
```

Expected outcome:

```text
Lower input tokens.
Less irrelevant context.
Better task focus.
```

---

### 7. Context Slice Usage Tracking

Track which context files were loaded and used.

```ts
export type ContextUsage = {
  readonly loadedFiles: readonly string[]
  readonly estimatedTokens: number
  readonly taskRelevantFiles: readonly string[]
  readonly unusedFiles: readonly string[]
}
```

Expected outcome:

```text
Reports can show unused context and suggest smaller context plans.
```

---

## Token Usage Optimisations

### 1. Context Manifest Before Context Content

Before loading full files, provide a compact manifest.

```md
# Available Context

- overview.md: purpose and ownership
- routes.md: frontend routing
- api-client.md: API usage
- testing.md: test commands
- security.md: auth and sensitive rules
```

The agent can request or be given only relevant files.

Expected outcome:

```text
Lower default context token footprint.
```

---

### 2. Task-Scoped Context Planner

Add a planner that maps task capabilities to context slices.

```ts
export type ContextPlan = {
  readonly required: readonly string[]
  readonly optional: readonly string[]
  readonly excluded: readonly string[]
  readonly reason: readonly ContextPlanReason[]
}
```

Expected outcome:

```text
AgentCtx can explain why context was included.
```

---

### 3. Deduplicate Context Across Points

In monorepos, root context and point context can repeat information.

Add dedupe:

```text
root mesh says frontend depends on API
frontend AGENTS.md references root mesh instead of repeating it
```

Expected outcome:

```text
Reduced context duplication.
Smaller prompts.
Cleaner reports.
```

---

### 4. Token Density Score

Score context by useful signal per token.

```ts
export type TokenDensityScore = {
  readonly totalTokens: number
  readonly uniqueFactCount: number
  readonly duplicateFactCount: number
  readonly estimatedSignalDensity: number
}
```

Expected outcome:

```text
AgentCtx can recommend removing bloated context slices.
```

---

### 5. Context Budget Enforcement

Default budgets:

```text
root AGENTS.md: 1,500 tokens
context-point AGENTS.md: 1,200 tokens
individual slice: 2,000 tokens
task context pack: 6,000 tokens
```

Expected outcome:

```text
Large repos do not automatically create huge prompts.
```

---

## Agent-Performance Additions Worth Building

These additions improve performance or save tokens from an agent perspective.

### 1. Context Pack Files

Generate task-specific bundles.

```text
.agentctx/packs/
  frontend-bugfix.md
  api-contract-change.md
  auth-sensitive-change.md
  worker-retry-change.md
```

Why it helps:

```text
Agents get a pre-optimised context bundle for common task types.
```

---

### 2. Context Manifest

Generate:

```text
.agentctx/context/manifest.json
```

Contains:

```json
{
  "files": [
    {
      "path": ".agentctx/context/routes.md",
      "tokens": 912,
      "capabilities": ["frontend", "routing"],
      "summary": "Angular route structure and guards"
    }
  ]
}
```

Why it helps:

```text
Agents can choose context intelligently without reading every file.
```

---

### 3. Relevance Ranking

Rank context files for a task.

```ts
export type RankedContextFile = {
  readonly path: string
  readonly score: number
  readonly reason: string
}
```

Why it helps:

```text
Only top-ranked context is loaded by default.
```

---

### 4. Context Delta Mode

For follow-up tasks, provide only changed context.

```bash
agentctx context delta --since main
```

Why it helps:

```text
Agents do not re-read stable context on every run.
```

---

### 5. Failure Memory

Store benchmark failure patterns.

```text
Task failed because:
- auth middleware context was missing
- API contract context was not loaded
```

Why it helps:

```text
Future context plans improve automatically.
```

---

### 6. Context Anti-Pattern Detection

Detect bad generated context.

Examples:

```text
repeated facts
too many file lists
too much implementation detail
missing commands
missing security boundaries
```

Why it helps:

```text
Improves context quality and reduces token waste.
```

---

### 7. Agent Action Budget

Limit agent behavior.

```ts
export type AgentActionBudget = {
  readonly maxFilesTouched: number
  readonly maxCommands: number
  readonly maxRuntimeMs: number
  readonly maxInputTokens: number
  readonly maxOutputTokens: number
}
```

Why it helps:

```text
Prevents runaway agents and makes benchmarks comparable.
```

---

### 8. Context Load Audit

Record:

```text
which context files were loaded
which were relevant
which were unused
which were missing
```

Why it helps:

```text
Turns token usage into actionable context optimisation.
```

---

### 9. Prompt Template Variants

Benchmark prompt styles.

```text
minimal task prompt
structured task prompt
task + context manifest
task + full context
task + context pack
```

Why it helps:

```text
Shows which prompt/context strategy actually performs best.
```

---

### 10. Golden Patch Comparison

For benchmark fixtures, define an ideal patch.

```text
expected.patch
```

Then compare agent diff to ideal diff.

Why it helps:

```text
Measures solution quality beyond test pass/fail.
```

Do not make exact patch matching required. Use it as evidence.

---

## Task Format

Each task lives in:

```text
.agentctx/bench/tasks/add-user-display-name/
  task.md
  expected.md
  scoring.config.ts
  expected.patch optional
```

### task.md

```md
# Task

Add a `displayName` field to the user profile flow.

## Requirements

- Backend API must return `displayName`.
- Shared contract must include `displayName`.
- Angular UI must render `displayName` on the profile page.
- Existing tests must pass.
- Do not modify infrastructure files.
```

### expected.md

```md
# Expected Outcome

The user profile flow supports `displayName` end-to-end.

## Must Happen

- API response includes `displayName`.
- Shared contract includes `displayName`.
- Angular profile page renders `displayName`.
- Tests are updated or added.

## Must Not Happen

- Do not bypass auth.
- Do not hardcode display names.
- Do not edit `.env`.
- Do not modify deployment files.
```

### scoring.config.ts

```ts
import { defineBenchTask } from "agentctx/bench"

export default defineBenchTask({
  id: "add-user-display-name",
  title: "Add displayName across Angular and .NET",
  difficulty: "medium",

  capabilities: [
    "frontend",
    "backend-api",
    "shared-contracts"
  ],

  contextPoints: [
    "angular-web",
    "dotnet-api",
    "shared-contracts"
  ],

  conditions: [
    "no-context",
    "agentctx-context"
  ],

  expectedFiles: [
    "apps/angular-web/src/app/profile/**",
    "services/dotnet-api/**",
    "packages/shared-contracts/**"
  ],

  forbiddenFiles: [
    ".env",
    "infra/**",
    "deploy/**"
  ],

  scorers: [
    "diff",
    "tokens",
    "security",
    "angular",
    "dotnet",
    "shared-contracts"
  ]
})
```

---

## Angular + .NET Example

### Monorepo

```text
repo/
  apps/angular-web/
  services/dotnet-api/
  packages/shared-contracts/
```

### Same Benchmark Structure

Both frameworks use:

```text
task.md
expected.md
scoring.config.ts
```

### Different Evaluation Outputs

Angular adapter evaluates:

```text
Angular build passes
Angular tests pass
Angular lint passes
profile component renders displayName
API client uses shared contract
no unrelated UI files changed
```

Commands:

```bash
pnpm --filter angular-web build
pnpm --filter angular-web test
pnpm --filter angular-web lint
```

.NET adapter evaluates:

```text
dotnet build passes
dotnet test passes
profile endpoint returns displayName
DTO includes displayName
auth remains enforced
no unnecessary migration added
```

Commands:

```bash
dotnet build services/dotnet-api
dotnet test services/dotnet-api.Tests
```

Shared contracts adapter evaluates:

```text
contract includes displayName
frontend and backend consume the same contract
no incompatible breaking changes
```

Final normalised report:

```text
Task: Add user displayName

No Context:
- Success: false
- Angular build: passed
- Angular tests: failed
- .NET build: passed
- .NET tests: failed
- Tokens: 82,000
- Forbidden files touched: 2

AgentCtx Context:
- Success: true
- Angular build: passed
- Angular tests: passed
- .NET build: passed
- .NET tests: passed
- Tokens: 39,500
- Forbidden files touched: 0

Result:
AgentCtx completed the cross-context task and reduced token usage by 52%.
```

---

## Scoring Model

Use weighted scoring.

```ts
export type BenchScore = {
  readonly success: number
  readonly tests: number
  readonly security: number
  readonly fileAccuracy: number
  readonly tokenUsage: number
  readonly performance: number
  readonly maintainability: number
  readonly overall: number
}
```

Default weights:

```text
success: 30%
tests: 20%
security: 15%
file accuracy: 10%
token usage: 10%
performance: 10%
maintainability: 5%
```

Security-sensitive task weights:

```text
security: 25%
success: 25%
tests: 20%
token usage: 10%
performance: 10%
file accuracy: 5%
maintainability: 5%
```

Expected outcome:

```text
A task cannot score well if it passes tests but violates security or touches forbidden files.
```

---

## Scorer Types

### Core scorers

```text
diff scorer
token scorer
runtime scorer
security scorer
command scorer
file accuracy scorer
context usage scorer
```

### Framework scorers

```text
angular scorer
react scorer
vue scorer
dotnet scorer
node scorer
worker scorer
database scorer
infra scorer
```

### Optional scorers

```text
golden patch scorer
human review scorer
dual-agent review scorer
context quality scorer
```

---

## Security Requirements

Bench must never leak secrets into reports.

Rules:

1. Redact secret values.
2. Do not include `.env` values.
3. Flag `.env` modifications.
4. Flag credentials in diffs.
5. Flag public context exposure.
6. Keep raw logs local.
7. Make HTML reports safe to share only when `--public-safe` is used.

Expected outcome:

```text
Security findings can fail a benchmark even if tests pass.
```

---

## Telemetry Events

Use append-only NDJSON.

Example:

```json
{"type":"run.start","runId":"bench_123","suite":"polyglot"}
{"type":"condition.start","condition":"agentctx-context"}
{"type":"context.loaded","tokens":4200,"files":6}
{"type":"agent.complete","durationMs":41000}
{"type":"scoring.complete","overall":0.87}
{"type":"run.complete","success":true}
```

Expected outcome:

```text
Terminal UI and HTML reports can use the same event stream.
```

---

## Report Outputs

### JSON

Machine-readable.

### Markdown

PR-friendly and easy to read.

### HTML

Visual report for teams.

### NDJSON

Live telemetry stream.

Report sections:

```text
Executive Summary
Task Details
Conditions Compared
Success Metrics
Token Usage
Runtime
Diff Quality
Security Findings
Framework Evidence
Context Usage
Recommendations
Raw Evidence
```

---

## Dual-Agent Runner Requirements

Agent 1 implements.

Agent 2 evaluates every batch.

Agent 2 must score:

```text
correctness
performance
token usage
security
usability
code readability
framework-agnostic design
distribution readiness
```

Agent 2 must reject if:

```text
results are not reproducible
token metrics are vague
security issues are ignored
framework logic leaks into core
benchmarks are too slow
reports exaggerate claims
context loading is wasteful
```

---

## Development Batches

### Batch 1: Core Types and Package Setup

Outcomes:

- `packages/bench-core` exists.
- TypeScript strict mode works.
- Core types compile.
- Initial unit tests pass.
- No framework-specific logic exists in core.

Acceptance criteria:

```text
pnpm test packages/bench-core passes
all public types are documented
Agent 2 score >= 8.5
```

---

### Batch 2: Task Definition and Validation

Outcomes:

- `task.md`, `expected.md`, `scoring.config.ts` supported.
- Zod validation exists.
- Invalid tasks produce helpful errors.
- Example task included.

Acceptance criteria:

```text
agentctx bench validate passes for valid fixture
invalid fixture fails with actionable error
```

---

### Batch 3: Condition Runner

Outcomes:

- `no-context` and `agentctx-context` conditions implemented.
- Runs are isolated.
- Run metadata is persisted.
- Conditions can run independently.

Acceptance criteria:

```text
two conditions produce separate workspaces
user repo is not modified
```

---

### Batch 4: Agent Adapter Interface

Outcomes:

- Generic `AgentAdapter` exists.
- Manual adapter exists for tests.
- Copilot adapter placeholder exists.
- Adapter failures are captured cleanly.

Acceptance criteria:

```text
manual adapter can simulate success and failure
adapter errors appear in report
```

---

### Batch 5: Core Scorers

Outcomes:

- command scorer
- diff scorer
- forbidden file scorer
- expected file scorer
- runtime scorer

Acceptance criteria:

```text
forbidden file change fails benchmark
expected file miss reduces score
```

---

### Batch 6: Token Metrics

Outcomes:

- token estimator exists.
- context tokens measured.
- prompt tokens measured.
- output tokens measured where possible.
- token-per-success metric exists.

Acceptance criteria:

```text
report shows token usage per condition
estimates are clearly labelled
```

---

### Batch 7: Security Scoring

Outcomes:

- secret scanner exists.
- `.env` changes flagged.
- dangerous commands flagged.
- security findings appear in report.

Acceptance criteria:

```text
secret-like diff creates security finding
security-critical finding can fail task
```

---

### Batch 8: Capability Detection

Outcomes:

- frontend capability detected.
- backend API capability detected.
- shared contract capability detected.
- worker capability detected.
- infra capability detected.

Acceptance criteria:

```text
polyglot fixture capabilities are detected correctly
low-confidence detections are labelled
```

---

### Batch 9: Framework Adapters

Outcomes:

- Angular scorer.
- .NET scorer.
- shared contracts scorer.
- adapter registry.
- normalised evidence output.

Acceptance criteria:

```text
Angular and .NET evidence appear in same report shape
core package has no Angular or .NET imports
```

---

### Batch 10: A/B Comparison Reports

Outcomes:

- no-context vs agentctx-context comparison.
- success delta.
- token delta.
- runtime delta.
- security delta.
- markdown report.

Acceptance criteria:

```text
report explains improvements and regressions
sample size is visible
```

---

### Batch 11: Performance Optimisation

Outcomes:

- fingerprint cache.
- skip unchanged runs.
- parallel workers.
- fixture snapshotting.
- low-overhead telemetry.

Acceptance criteria:

```text
unchanged benchmark is skipped
conditions can run in parallel
```

---

### Batch 12: Context Usage and Recommendations

Outcomes:

- loaded context recorded.
- unused context recorded.
- missing context recorded.
- recommendations generated.

Acceptance criteria:

```text
report shows which context files were loaded and why
```

---

### Batch 13: HTML Report and Terminal UI

Outcomes:

- static HTML report.
- terminal progress UI.
- token charts.
- condition comparison cards.
- security findings table.

Acceptance criteria:

```text
HTML report renders with Playwright test
terminal UI does not block benchmark execution
```

---

### Batch 14: User Bench Init

Outcomes:

- `agentctx bench init`.
- task template.
- suite config.
- example scoring config.
- docs.

Acceptance criteria:

```text
new user can create first benchmark in under 5 minutes
```

---

### Batch 15: Baselines and CI

Outcomes:

- baseline create.
- baseline compare.
- CI mode.
- fail thresholds.
- JSON output.

Acceptance criteria:

```text
CI can fail on token regression or security regression
```

---

### Batch 16: Public Launch Fixture

Outcomes:

- Angular + .NET fixture.
- at least 5 realistic tasks.
- reproducible benchmark report.
- methodology page.
- limitations page.

Acceptance criteria:

```text
public report is reproducible from documented commands
claims are supported by raw evidence
```

---

## Expected Outcomes by End State

AgentCtx Bench should prove:

```text
AgentCtx improves task success when context matters.
AgentCtx reduces token usage compared with full repo context.
AgentCtx reduces irrelevant file changes.
AgentCtx improves safety on security-sensitive tasks.
AgentCtx context points help polyglot monorepos.
Dual-agent execution improves quality when review is worth the overhead.
```

It should also reveal when AgentCtx does not help.

That honesty is important.

---

## Final Agent Instructions

Build this as infrastructure, not a demo.

Keep the core small.

Keep framework logic in adapters.

Prioritise hard evidence.

Measure tokens carefully.

Make every result reproducible.

Do not overclaim.

Make the reports useful enough that a senior dev team would trust them in a technical decision.
