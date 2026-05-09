<!-- agentctx:start -->
<div class="docs-hero">
<div class="docs-kicker">AGENTS.md</div>
<h1>Agent Instructions</h1>
<p class="docs-lead">Primary operating guide for repo-aware changes in this workspace.</p>
<div class="docs-chip-row"><span class="docs-chip">Deterministic outputs</span><span class="docs-chip">Metadata-first scanning</span><span class="docs-chip">Generated context blocks</span></div>
</div>

<div class="docs-section-heading"><h2>Snapshot</h2><span class="docs-note">How to read this file quickly</span></div>
<div class="docs-grid">
<div class="docs-card docs-span-4">
<h3>Scope</h3>
<p>This file is generated for the current workspace or point scope.</p>
<ul><li>Point docs-agentctx at docs-agentctx</li><li>Point type: docs</li></ul>
</div>
<div class="docs-card docs-span-4">
<h3>Core files</h3>
<p>The entry points that define the current repo contract.</p>
<ul><li>agentctx.config.ts</li><li>package.json</li><li>docs-agentctx/package.json</li></ul>
</div>
<div class="docs-card docs-span-4 docs-card--accent">
<h3>Rules</h3>
<p>Generated output stays stable and safe by default.</p>
<ul><li>Stable ordering</li><li>No secret values</li><li>Prefer metadata over full source dumps</li></ul>
</div>
</div>

<h2>Context map</h2>
- Architecture: `.agentctx/context/architecture.md`
- Conventions: `.agentctx/context/conventions.md`
- Runtime: `.agentctx/context/runtime.md`
- Testing: `.agentctx/context/testing.md`
- Workflows: `.agentctx/context/workflows.md`

<h2>Reading order</h2>
<div class="docs-grid">
<div class="docs-card docs-span-6">
<h3>1. Architecture</h3>
<p>Understand the compiler pipeline and package boundaries first.</p>
</div>
<div class="docs-card docs-span-6">
<h3>2. Conventions</h3>
<p>Check the rules that govern generated outputs and diffs.</p>
</div>
<div class="docs-card docs-span-6">
<h3>3. Testing</h3>
<p>Use the smallest relevant test suite before finalizing changes.</p>
</div>
<div class="docs-card docs-span-6">
<h3>4. Workflows</h3>
<p>Run build, sync, and check through the documented commands.</p>
</div>
</div>

# Architecture

## Summary

- Context scope: point `core` at `packages/core`
- Point type: package
- Package manager: pnpm
- Languages: typescript
- Frameworks: (none detected)
- Workspace: detected
- Apps in scope: (none detected)
- Packages in scope: @agentctx/core (packages/core)
- Internal dependencies: (none detected)

## Important files

- `agentctx.config.ts`: AgentCtx configuration
- `package.json`: Project manifest and scripts
- `packages/core/package.json`: Package/app manifest in scope

# Conventions

## Summary

- Tooling detected: typescript
- Common scripts: build, test, typecheck 

## Rules

- Keep generated outputs deterministic (stable ordering; no timestamps).
- Do not include secret values in generated context.
- Prefer metadata/config scanning over dumping full source files.
- Make minimal, reviewable diffs; avoid sweeping refactors unless explicitly requested.
- Prefer strict typing; avoid `any` unless unavoidable and justified.
- Run typecheck for TS changes: `pnpm run typecheck`.

## Important files

- `packages/core/tsconfig.json`: Project convention/config (typescript)

# Testing

## Summary

- Detected test runners (deps): vitest
- Test config files detected: (none)

## Rules

- Run the smallest relevant test suite before finalizing changes.
- Preferred: `pnpm run test`

# Workflows

## Workflows

- Install: `pnpm install`
- Typecheck: `pnpm run typecheck`
- Test: `pnpm run test`
- Build: `pnpm run build`
- Update context: `agentctx build && agentctx sync`
<!-- agentctx:end -->
