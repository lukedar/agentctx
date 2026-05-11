<!-- agentctx:start -->
<div class="docs-hero">
<div class="docs-kicker">CLAUDE.md</div>
<h1>Claude Project Context</h1>
<p class="docs-lead">Structured context for reading the repo like a code schematic.</p>
<div class="docs-chip-row"><span class="docs-chip">Workspace aware</span><span class="docs-chip">Point aware</span><span class="docs-chip">Generated automatically</span></div>
</div>

<div class="docs-section-heading"><h2>Snapshot</h2><span class="docs-note">What this file covers</span></div>
<div class="docs-grid">
<div class="docs-card docs-span-6">
<h3>Architecture</h3>
<p>Package roles, compiler flow, and why the layers are split.</p>
</div>
<div class="docs-card docs-span-6">
<h3>Frontend / API / DB</h3>
<p>Only the signals detected in this scope are surfaced.</p>
</div>
<div class="docs-card docs-span-6">
<h3>Testing</h3>
<p>Use the smallest relevant suite first, then broaden only when needed.</p>
</div>
<div class="docs-card docs-span-6">
<h3>Workflows</h3>
<p>The commands for build, sync, check, and local iteration.</p>
</div>
</div>

# Architecture

## Responsibilities

- Context scope: point `cli` at `packages/cli`
- Point type: package
- Point depends on: core, adapters, targets
- Package manager: pnpm
- Languages: typescript
- Frameworks: (none detected)
- Workspace: detected
- Apps in scope: (none detected)
- Packages in scope: agentctx (packages/cli)
- Internal dependencies: (none detected)

## Dependencies

- agentctx.config.ts: AgentCtx configuration
- package.json: Project manifest and scripts
- packages/cli/package.json: Package/app manifest in scope

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
- `packages/cli/package.json`: Package/app manifest in scope

# Runtime

## Responsibilities

- Runtimes detected: node
- Runtime markers: package.json

## Dependencies

- package.json: Runtime manifest or entrypoint

## Critical Invariants

- Keep package scripts and runtime entrypoints aligned when changing startup behavior.

## Failure Modes

- No confirmed failure modes detected.

## Safe Commands

- No confirmed safe commands detected.

## Useful For

- startup changes
- runtime dependency updates
- hosting changes

## Unsafe Changes

- Broad rewrites outside the current context scope without loading related context first.

## Evidence

- `package.json`: Runtime manifest or entrypoint

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
