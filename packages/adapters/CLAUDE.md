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

- Context scope: point `adapters` at `packages/adapters`
- Point type: package
- Point depends on: core
- Package manager: pnpm
- Languages: typescript
- Frameworks: (none detected)
- Workspace: detected
- Apps in scope: (none detected)
- Packages in scope: @agentctx/adapters (packages/adapters)
- Internal dependencies: (none detected)

## Important files

- `agentctx.config.ts`: AgentCtx configuration
- `package.json`: Project manifest and scripts
- `packages/adapters/package.json`: Package/app manifest in scope

# Frontend

## Summary

- (MVP) No frontend framework detected
- Frontend-relevant scope entries: @agentctx/adapters (packages/adapters)

# API

## Summary

- API-related frameworks detected: (none)
- API artifacts detected: (none)
- Route paths detected: (none)
- Route conventions detected: (none)
- Spec files: (none)

## Rules

- No API specs or route files were found in the scanned scope; rely on source code and existing backend docs.

# Database

## Summary

- Database artifacts detected: (none)
- Spec/migration files: (none)

## Rules

- No DB schema/migration artifacts were found in the scanned scope.

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

# Glossary
<!-- agentctx:end -->
