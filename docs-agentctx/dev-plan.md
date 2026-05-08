# Dev Plan

<div class="docs-hero">
  <span class="docs-kicker">Execution map</span>
  <h1>Build the framework in batches, gate each batch, and keep the plan readable.</h1>
  <p class="docs-lead">This is the implementation map for AgentCtx. It separates the MVP framework from deferred work and describes the dual-agent batch loop that validates each step.</p>
</div>

## Operating Model

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Batch</h3>
    <p>Pick a small group of related steps.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Build</h3>
    <p>Implement only that batch and keep the scope tight.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Gate</h3>
    <p>Run tests, typecheck, build, sync, check, and the dual-agent evaluator.</p>
  </div>
</div>

Batch loop:
1. Pick one small group of related steps.
2. Implement only that batch.
3. Run the package tests that cover the touched code.
4. Run `pnpm -r typecheck`.
5. Run `pnpm context:build`, `pnpm context:sync`, and `pnpm context:check`.
6. Run the dual-agent gate with `pnpm da:eval`.
7. If the gate fails, fix the batch and rerun it.
8. Only move to the next batch after PASS.

Recommended batch size:
- about 10 implementation steps
- earlier gating if the change touches shared contracts, generated outputs, or sync behavior

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Rule</h3>
  <p>Do not move to the next batch until the current batch passes the dual-agent gate.</p>
</div>

## MVP Framework Plan

The MVP is the complete local-first framework: scan, model, render, sync, validate.

### Batch 1: Core contracts

Implement the shared runtime model first.

Files:
- `packages/core/src/types.ts`
- `packages/core/src/index.ts`

Ship:
- config types
- fact types
- graph types
- context-block types
- plugin interface
- target adapter interface
- deterministic result/error models

Done when:
- later packages can depend on `core` without bringing in CLI or filesystem logic
- the exported types describe the whole framework flow

### Batch 2: Config loading and file indexing

Turn `agentctx.config.ts` into a normalized runtime config and index the repo deterministically.

Files:
- `packages/core/src/config.ts`
- `packages/core/src/repoFileIndex.ts`

Ship:
- config loader
- defaults
- include/exclude rules
- workspace and point normalization
- stable hashing
- secret-safe file indexing

Done when:
- the same repo state always produces the same indexed file order
- generated directories and caches are excluded by default

### Batch 3: Fact extraction

Add metadata-first detectors.

Files:
- `packages/adapters/src/index.ts`
- `packages/adapters/src/plugins/*`

Ship:
- package manager detection
- workspace detection
- TypeScript detection
- framework detection from `package.json`
- test runner detection
- scripts detection
- config-file detection
- route detection
- API and DB artifact facts

Done when:
- each plugin is deterministic
- plugins emit facts, not source dumps
- plugin behavior is covered by fixtures

### Batch 4: Graph compilation

Compile facts into a useful structural model.

Files:
- `packages/core/src/graph.ts`

Ship:
- package and app nodes
- internal dependency edges
- point-aware scoping
- generated-path filtering

Done when:
- the graph explains how the repo is organized
- context points can be mapped to real boundaries

### Batch 5: Context-block planning

Use the graph and facts to generate readable, bounded context blocks.

Files:
- `packages/core/src/sections.ts`

Ship:
- architecture
- conventions
- testing
- workflows
- API
- database
- frontend
- glossary
- truncation rules

Done when:
- the same input always produces the same context-block order
- context blocks read like a maintained guide, not a scan dump

### Batch 6: Target rendering

Render the shipped instruction files only.

Files:
- `packages/targets/src/index.ts`
- `packages/targets/src/*`

Ship:
- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules/project.mdc`
- `.github/copilot-instructions.md`
- `llms.txt`

Done when:
- every public target is implemented
- unsupported targets are not exposed as real options

### Batch 7: Sync and check

Write outputs back into the repo safely.

Files:
- `packages/cli/src/lib/sync/generatedBlock.ts`
- `packages/cli/src/lib/sync/sync.ts`
- `packages/cli/src/lib/check/*`

Ship:
- generated block merge logic
- workspace sync
- point sync destinations
- drift detection
- stale-output checks

Done when:
- sync is idempotent
- manual edits outside generated blocks are preserved
- check can explain why output is stale

### Batch 8: CLI

Expose the framework with stable command behavior.

Files:
- `packages/cli/src/cli.ts`
- `packages/cli/src/commands/init.ts`
- `packages/cli/src/commands/build.ts`
- `packages/cli/src/commands/sync.ts`
- `packages/cli/src/commands/check.ts`
- `packages/cli/src/lib/*`

Ship:
- `init`
- `build`
- `sync`
- `check`
- `--json` output shapes
- shared point selection logic

Done when:
- build, sync, and check all use the same scope resolution rules

### Batch 9: Context points

Make repo boundaries explicit and first-class.

Files:
- `agentctx.config.ts`
- `packages/core/src/config.ts`
- `packages/core/src/sections.ts`
- `packages/cli/src/lib/points.ts`

Ship:
- per-point config
- per-point targets
- point-scoped build/sync/check
- dogfooded points in this repo

Done when:
- workspace and point outputs share the same framework pipeline
- point outputs stay meaningfully smaller than the workspace output

### Batch 10: Quality gate and dogfooding

Make the framework self-validating.

Files:
- `packages/dual-agent-runner/src/*`
- `packages/dual-agent-runner-ui/src/*`
- `package.json`
- `docs-agentctx/quality-gate.md`

Ship:
- `pnpm da:eval`
- ordered step evaluation
- persisted evaluation reports
- docs page for the runner and gate
- repo-level dogfood scripts

Done when:
- the repo can validate itself with the same gate used in CI

## Framework Design Notes

The framework should always follow these rules:
- deterministic outputs only
- stable ordering everywhere
- no timestamps in generated content
- no secret values in generated content
- metadata-first scanning before source-heavy heuristics
- shared config and scope logic across build, sync, and check

## MVP Acceptance Criteria

The MVP is complete when:
1. `agentctx init`, `build`, `sync`, and `check` work on a real repo.
2. Workspace and point outputs are deterministic.
3. Sync is safe and idempotent.
4. The dual-agent gate passes on the repo.
5. The repo dogfoods the framework on itself.
6. Tests cover the core contracts, adapters, targets, and sync behavior.

## Future Enhancements

These are intentionally deferred until the MVP framework is stable.

### 1. AST-aware source analysis

Add deeper code intelligence when metadata-first scanning is not enough.

Possible scope:
- import graph extraction
- symbol-level understanding
- source snippets
- framework-specific route resolution

### 2. Affected workflows

Expand point selection through `dependsOn` relationships.

Possible commands:
- `agentctx build --affected`
- `agentctx sync --affected`
- `agentctx check --affected`

### 3. Watch mode

Add an incremental rebuild loop.

Possible scope:
- `agentctx watch`
- optional `--sync`
- debounced rebuilds
- partial scope rebuilds

### 4. GitHub Action package

Provide CI automation as a reusable package.

Possible scope:
- repo-check workflow wrapper
- report publishing
- status annotations

### 5. Docs playground

Add a lightweight interactive demo.

Possible scope:
- sample repo presets
- before/after context previews
- target output diffs

### 6. Broader target support

Add targets beyond the shipped MVP registry.

Possible examples:
- Windsurf
- Codex-specific instruction files
- other agent/runtime-specific formats

### 7. Incremental cache improvements

Make caching more selective and faster.

Possible scope:
- per-file invalidation
- partial scope reuse
- hash-based fact reuse

## Current State

The repository has already completed the MVP execution and hardening work.

What remains is future capability work, not MVP completion.

Source-of-truth plan files:
- `implementation-plan/002-agentctx-master-plan.md`
- `implementation-plan/004-future-enhancements.md`
