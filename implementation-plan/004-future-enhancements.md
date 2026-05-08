# AgentCtx Future Enhancements

This file captures the work that remains after the MVP/hardening plan is complete. It is intentionally separate from the shipped plan so the repo keeps a clear boundary between `done`, `deferred`, and `post-MVP`.

## Status

- MVP execution and hardening are complete.
- The repo currently covers the local-first compiler, context points, sync/check/build workflows, dogfooding, and dual-agent gating.
- The items below are intentionally deferred.

## Deferred Work

### 1. AST-aware source analysis

Add deeper code intelligence when metadata-first scanning is not enough.

Possible scope:
- import graph extraction
- symbol-level understanding
- source-anchored context snippets
- framework-specific route and entrypoint resolution

Why it is deferred:
- it increases complexity and build cost
- it is not required for the current MVP contract
- the existing metadata-first model is already useful and deterministic

### 2. `--affected` workflows

Expand point selection through `dependsOn` relationships.

Possible commands:
- `agentctx build --affected`
- `agentctx sync --affected`
- `agentctx check --affected`

Why it is deferred:
- the graph needs more relationship types before affected selection is meaningful
- affected workflows add policy and UX decisions that are larger than the MVP scope

### 3. Watch mode

Add an incremental rebuild loop.

Possible scope:
- `agentctx watch`
- optional `--sync`
- file change debounce
- partial rebuilds by scope

Why it is deferred:
- useful, but not necessary for correctness
- can be added once the build graph is stable and clearly measured

### 4. GitHub Action package

Provide CI automation as a reusable package.

Possible scope:
- repo-check workflow wrapper
- report publishing
- status annotations
- examples for monorepos

Why it is deferred:
- the CLI is the primary product surface
- CI packaging should follow after local workflows are stable

### 5. Docs playground

Add a lightweight interactive demo.

Possible scope:
- sample repo presets
- before/after context previews
- target output diffs
- policy explanations

Why it is deferred:
- docs should mirror shipped behavior first
- a playground is more useful once the behavior stops changing often

### 6. Broader target support

Add targets beyond the shipped MVP registry.

Possible examples:
- Windsurf
- Codex-specific instruction files
- other agent/runtime-specific formats

Why it is deferred:
- placeholder targets were removed from the public surface
- new targets should only be added when they have concrete renderers and tests

### 7. Incremental cache improvements

Make caching more selective and faster.

Possible scope:
- per-file invalidation
- partial scope reuse
- hash-based fact reuse
- more explicit cache diagnostics

Why it is deferred:
- current cache behavior is already correct and deterministic
- performance optimizations should follow observed bottlenecks

## Notes

- The current implementation deliberately favors determinism and explicitness over aggressive automation.
- Future work should preserve the existing contract: local-first, secret-safe, reproducible, and test-backed.
- `dependsOn` exists today, but only as a foundation for future affected workflows.
