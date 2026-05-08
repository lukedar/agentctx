<!-- agentctx:start -->
<div class="docs-hero">
<div class="docs-kicker">Copilot</div>
<h1>Copilot instructions</h1>
<p class="docs-lead">Compact coding rules for editor-assist workflows in this repository.</p>
<div class="docs-chip-row"><span class="docs-chip">Deterministic</span><span class="docs-chip">Reviewable</span><span class="docs-chip">Safe by default</span></div>
</div>

<h2>Rules at a glance</h2>
<div class="docs-grid">
<div class="docs-card docs-span-4">
<h3>Boundaries</h3>
<p>Prefer existing package boundaries and avoid cross-layer leakage.</p>
</div>
<div class="docs-card docs-span-4">
<h3>Outputs</h3>
<p>Keep generated output deterministic and stable across runs.</p>
</div>
<div class="docs-card docs-span-4">
<h3>Validation</h3>
<p>Run typecheck and tests before finalizing changes.</p>
</div>
</div>

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
