<!-- agentctx:start -->
<div class="docs-hero">
<div class="docs-kicker">AGENTS.md</div>
<h1>Agent Instructions</h1>
<p class="docs-lead">Primary operating guide for repo-aware changes in this workspace.</p>
<div class="docs-chip-row"><span class="docs-chip">Deterministic outputs</span><span class="docs-chip">Metadata-first scanning</span><span class="docs-chip">Generated CtxBlocks</span></div>
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
- Overview: `.agentctx/context/overview.md`
- Security: `.agentctx/context/security.md`
- Architecture: `.agentctx/context/architecture.md`
- Boundaries: `.agentctx/context/boundaries.md`
- Conventions: `.agentctx/context/conventions.md`
- Commands: `.agentctx/context/commands.md`
- Dependencies: `.agentctx/context/dependencies.md`
- Testing: `.agentctx/context/testing.md`
- Public Api: `.agentctx/context/public-api.md`
- Exports: `.agentctx/context/exports.md`
- Compatibility: `.agentctx/context/compatibility.md`
- Usage: `.agentctx/context/usage.md`
- Versioning: `.agentctx/context/versioning.md`

<h2>Recommended Load Order</h2>
1. `.agentctx/context/overview.md`
2. `.agentctx/context/security.md`
3. `.agentctx/context/architecture.md`
4. `.agentctx/context/boundaries.md`
5. `.agentctx/context/commands.md`
6. `.agentctx/context/testing.md`

# Architecture

## Summary

- Context scope: point `dual-agent-runner` at `packages/dual-agent-runner`
- Point type: package
- Package manager: pnpm
- Languages: typescript
- Frameworks: (none detected)
- Workspace: detected
- Apps in scope: (none detected)
- Packages in scope: dual-agent-runner (packages/dual-agent-runner)
- Internal dependencies: (none detected)

## Important files

- `agentctx.config.ts`: AgentCtx configuration
- `package.json`: Project manifest and scripts
- `packages/dual-agent-runner/package.json`: Package/app manifest in scope

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

- `packages/dual-agent-runner/tsconfig.json`: Project convention/config (typescript)

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
