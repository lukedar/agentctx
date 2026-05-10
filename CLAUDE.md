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

## Summary

- Context scope: workspace
- Package manager: pnpm
- Languages: typescript
- Frameworks: react, vite
- Workspace: detected
- Apps in scope: (none detected)
- Packages in scope: @agentctx/adapters (packages/adapters), @agentctx/core (packages/core), @agentctx/targets (packages/targets), agentctx (packages/cli), agentctx-docs (docs-agentctx-v1), …
- Internal dependencies: @agentctx/adapters -> @agentctx/core, @agentctx/targets -> @agentctx/core, agentctx -> @agentctx/adapters, agentctx -> @agentctx/core, agentctx -> @agentctx/targets, …

## Important files

- `agentctx.config.ts`: AgentCtx configuration
- `package.json`: Project manifest and scripts
- `docs-agentctx-v1/package.json`: Package/app manifest in scope
- `docs-agentctx/package.json`: Package/app manifest in scope
- `docs/package.json`: Package/app manifest in scope
- `packages/adapters/package.json`: Package/app manifest in scope
- `packages/cli/package.json`: Package/app manifest in scope
- `packages/core/package.json`: Package/app manifest in scope
- `packages/dual-agent-runner-ui/package.json`: Package/app manifest in scope
- `packages/dual-agent-runner/package.json`: Package/app manifest in scope

# Runtime

## Summary

- Runtimes detected: node
- Runtime markers: docs-agentctx-v1/package.json

## Rules

- Keep package scripts and runtime entrypoints aligned when changing startup behavior.

## Important files

- `docs-agentctx-v1/package.json`: Runtime manifest or entrypoint

# Frontend

## Summary

- Frontend-related frameworks detected: react, vite
- Frontend implementation shape: Component-driven React UI detected. Bundler-led frontend entrypoint detected.
- Frontend-relevant scope entries: @agentctx/adapters (packages/adapters), @agentctx/core (packages/core), @agentctx/targets (packages/targets), agentctx (packages/cli), agentctx-docs (docs-agentctx-v1), …

## Rules

- Keep components, state boundaries, and adjacent route or data-loading code aligned when changing UI behavior.

# Operations

## Summary

- Operational surfaces detected: github-actions
- Operations implementation shape: Automation workflow definitions detected.
- Operational artifacts: .github/workflows/dual-agent-gate.yml, .github/workflows/runner-docs.yml

## Rules

- Keep CI and deployment workflow changes deterministic and scoped to the environments they affect.

## Important files

- `.github/workflows/dual-agent-gate.yml`: Operational artifact
- `.github/workflows/runner-docs.yml`: Operational artifact

# Data

## Summary

- Data surfaces detected: job
- Data implementation shape: Scheduled or batch job definitions detected.
- Data artifacts: .github/workflows/dual-agent-gate.yml, .github/workflows/runner-docs.yml

## Rules

- Keep job boundaries, dependencies, and runtime assumptions aligned when changing batch or orchestration behavior.

## Important files

- `.github/workflows/dual-agent-gate.yml`: Data job or pipeline definition
- `.github/workflows/runner-docs.yml`: Data job or pipeline definition
- `.github/workflows/dual-agent-gate.yml`: Data or analysis artifact
- `.github/workflows/runner-docs.yml`: Data or analysis artifact

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
- Dev: `pnpm run dev`
- Typecheck: `pnpm run typecheck`
- Test: `pnpm run test`
- Build: `pnpm run build`
- Update context: `agentctx build && agentctx sync`
<!-- agentctx:end -->
