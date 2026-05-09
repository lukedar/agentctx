# CLI

<div class="docs-hero">
  <span class="docs-kicker">Command surface</span>
  <h1>Build, sync, and check the compiler outputs.</h1>
  <p class="docs-lead">
    The CLI is the orchestration layer. It resolves scope, runs the compiler, writes outputs, and validates drift.
  </p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Build</h3>
    <p>Compiles workspace and point outputs into <code>.agentctx</code>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Sync</h3>
    <p>Writes the generated files into repo locations, preserving manual edits outside generated blocks.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Check</h3>
    <p>Validates drift and stale outputs before a change is considered done.</p>
  </div>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Pipeline reference</h3>
  <p>Use <a href="/pipeline">Pipeline</a> for the execution order and framework language. This page covers commands only.</p>
</div>

## init
Creates `agentctx.config.ts` with sensible defaults.

## build
Builds **workspace** outputs and (optionally) **context point** outputs.

Output layout:
- Workspace:
  - `.agentctx/workspace/context/*.md`
  - `.agentctx/workspace/out/*`
- Context points:
  - `.agentctx/points/<point>/context/*.md`
  - `.agentctx/points/<point>/out/*`

Useful flags:
- `--cwd <dir>`
- `--changed` (skip work when nothing changed)
- `--dry-run`
- `--targets agents-md,claude,cursor,copilot,llms`
- `--point <name>` (build one point)
- `--points a,b,c` (build a subset)

## sync
Syncs **built outputs** into repo locations, preserving manual edits outside protected blocks.

- Default sync: copies workspace outputs into the repo root and point outputs into each configured point’s `path`.
- Scoped sync: `--point` / `--points` narrows the operation to selected points plus the workspace.
- Context markdown under `.agentctx/context/*` is always synced for the selected scope.

Useful flags:
- `--targets ...`
- `--point <name>`
- `--points a,b,c`
- `--check`

## check
Validates drift (workspace + points) and stale synced outputs.

Useful flags:
- `--point <name>`
- `--points a,b,c`

## Repo scripts

This repo exposes the CLI through root scripts:

- `pnpm context:build`
- `pnpm context:sync`
- `pnpm context:check`

In this repo, `context:sync` is a thin wrapper around `agentctx sync`.
