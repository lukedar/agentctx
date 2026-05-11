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
- Secrets: `.agentctx/context/secrets.md`
- Workspace: `.agentctx/context/workspace.md`
- Mesh: `.agentctx/context/mesh.md`
- Global Commands: `.agentctx/context/global-commands.md`
- Ownership: `.agentctx/context/ownership.md`
- Public Api: `.agentctx/context/public-api.md`
- Release: `.agentctx/context/release.md`
- Exports: `.agentctx/context/exports.md`
- Schemas: `.agentctx/context/schemas.md`
- Compatibility: `.agentctx/context/compatibility.md`
- Ci Cd: `.agentctx/context/ci-cd.md`
- Deployments: `.agentctx/context/deployments.md`
- Permissions: `.agentctx/context/permissions.md`
- Environments: `.agentctx/context/environments.md`
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

## Responsibilities

- Context scope: workspace
- Package manager: pnpm
- Languages: typescript
- Frameworks: (none detected)
- Workspace: detected
- Apps in scope: (none detected)
- Packages in scope: @agentctx/adapters (packages/adapters), @agentctx/core (packages/core), @agentctx/targets (packages/targets), agentctx (packages/cli), agentctx-docs (docs-agentctx), …
- Internal dependencies: @agentctx/adapters -> @agentctx/core, @agentctx/targets -> @agentctx/core, agentctx -> @agentctx/adapters, agentctx -> @agentctx/core, agentctx -> @agentctx/targets

## Dependencies

- agentctx.config.ts: AgentCtx configuration
- package.json: Project manifest and scripts
- docs-agentctx/package.json: Package/app manifest in scope
- docs/package.json: Package/app manifest in scope
- packages/adapters/package.json: Package/app manifest in scope
- packages/cli/package.json: Package/app manifest in scope
- packages/core/package.json: Package/app manifest in scope
- packages/dual-agent-runner/package.json: Package/app manifest in scope
- packages/targets/package.json: Package/app manifest in scope

## Critical Invariants

- Keep generated context deterministic, scoped, and secret-safe.

## Failure Modes

- No confirmed failure modes detected.

## Safe Commands

- No confirmed safe commands detected.

## Useful For

- repo orientation
- package boundary changes
- cross-context impact checks

## Unsafe Changes

- Broad rewrites outside the current context scope without loading related context first.

## Evidence

- `agentctx.config.ts`: AgentCtx configuration
- `package.json`: Project manifest and scripts
- `docs-agentctx/package.json`: Package/app manifest in scope
- `docs/package.json`: Package/app manifest in scope
- `packages/adapters/package.json`: Package/app manifest in scope
- `packages/cli/package.json`: Package/app manifest in scope
- `packages/core/package.json`: Package/app manifest in scope
- `packages/dual-agent-runner/package.json`: Package/app manifest in scope
- `packages/targets/package.json`: Package/app manifest in scope

# Conventions

## Responsibilities

- Tooling detected: typescript
- Common scripts: dev, build, test, typecheck 

## Dependencies

- packages/adapters/tsconfig.json: Project convention/config (typescript)
- packages/cli/tsconfig.json: Project convention/config (typescript)
- packages/core/tsconfig.json: Project convention/config (typescript)
- packages/dual-agent-runner/tsconfig.json: Project convention/config (typescript)
- packages/targets/tsconfig.json: Project convention/config (typescript)

## Critical Invariants

- Keep generated outputs deterministic (stable ordering; no timestamps).
- Do not include secret values in generated context.
- Prefer metadata/config scanning over dumping full source files.
- Make minimal, reviewable diffs; avoid sweeping refactors unless explicitly requested.
- Prefer strict typing; avoid `any` unless unavoidable and justified.
- Run typecheck for TS changes: `pnpm run typecheck`.

## Failure Modes

- No confirmed failure modes detected.

## Safe Commands

- No confirmed safe commands detected.

## Useful For

- code style changes
- tooling updates
- review preparation

## Unsafe Changes

- Broad rewrites outside the current context scope without loading related context first.

## Evidence

- `packages/adapters/tsconfig.json`: Project convention/config (typescript)
- `packages/cli/tsconfig.json`: Project convention/config (typescript)
- `packages/core/tsconfig.json`: Project convention/config (typescript)
- `packages/dual-agent-runner/tsconfig.json`: Project convention/config (typescript)
- `packages/targets/tsconfig.json`: Project convention/config (typescript)

# Testing

## Responsibilities

- Detected test runners (deps): vitest
- Test config files detected: (none)

## Dependencies

- No confirmed dependencies detected.

## Critical Invariants

- Run the smallest relevant test suite before finalizing changes.
- Preferred: `pnpm run test`

## Failure Modes

- No confirmed failure modes detected.

## Safe Commands

- No confirmed safe commands detected.

## Useful For

- test selection
- fixture updates
- quality gate checks

## Unsafe Changes

- Broad rewrites outside the current context scope without loading related context first.

# Workflows

## Responsibilities

- No confirmed responsibilities detected.

## Dependencies

- No confirmed dependencies detected.

## Critical Invariants

- Keep generated context deterministic, scoped, and secret-safe.

## Failure Modes

- No confirmed failure modes detected.

## Safe Commands

- Install: `pnpm install`
- Dev: `pnpm run dev`
- Typecheck: `pnpm run typecheck`
- Test: `pnpm run test`
- Build: `pnpm run build`
- Update context: `agentctx build && agentctx sync`

## Useful For

- local setup
- build validation
- release-safe command selection

## Unsafe Changes

- Running destructive reset, deploy, migration, or secret-rotation commands unless explicitly requested.
<!-- agentctx:end -->
