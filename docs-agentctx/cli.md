# CLI

<div class="docs-hero">
  <span class="docs-kicker">Command surface</span>
  <h1>Run the compiler, then sync the context your team owns.</h1>
  <p class="docs-lead">
    For everyday use, <code>agentctx build</code> reads <code>agentctx.config.ts</code> and runs it through the compiler. Teams use <code>sync</code> to update the CtxPoints they own, then <code>check</code> to detect drift.
  </p>
  <div class="docs-terminal">
    <div class="docs-terminal__bar">
      <span></span><span></span><span></span>
      <strong>agentctx / team workflow</strong>
    </div>
    <div class="docs-terminal__body">
      <div><span class="docs-terminal__prompt">$</span> <code>agentctx build</code></div>
      <div><span class="docs-terminal__ok">compiled</span> workspace + configured CtxPoints into <code>.agentctx</code></div>
      <div class="docs-terminal__gap"></div>
      <div><span class="docs-terminal__prompt">$</span> <code>agentctx sync --point frontend</code></div>
      <div><span class="docs-terminal__ok">synced</span> frontend-owned context surfaces</div>
      <div class="docs-terminal__gap"></div>
      <div><span class="docs-terminal__prompt">$</span> <code>agentctx sync --point backend</code></div>
      <div><span class="docs-terminal__ok">synced</span> backend-owned context surfaces</div>
      <div class="docs-terminal__gap"></div>
      <div><span class="docs-terminal__prompt">$</span> <code>agentctx sync --point infra</code></div>
      <div><span class="docs-terminal__ok">synced</span> infra-owned context surfaces</div>
      <div class="docs-terminal__gap"></div>
      <div><span class="docs-terminal__prompt">$</span> <code>agentctx check --point infra</code></div>
      <div><span class="docs-terminal__ok">clean</span> no infra context drift detected</div>
    </div>
  </div>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Why this is the quality gate</h3>
  <p>The pipeline is only trustworthy if the context in the repo matches the current source state. <code>build</code> compiles the latest facts, <code>sync</code> publishes the generated surfaces, and <code>check</code> verifies that nothing is stale or drifting before agents rely on it.</p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Build</h3>
    <p>Runs the configured repo through the compiler and writes build outputs into <code>.agentctx</code>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Sync</h3>
    <p>The most common team command: update generated context for the workspace or a team-owned CtxPoint.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Check</h3>
    <p>Every team owner uses it to detect drift in their generated context before it spreads.</p>
  </div>
</div>

## init
Creates `agentctx.config.ts` with the framework defaults.

```bash
agentctx init
```

Run this when a repo first adopts AgentCtx. The generated config starts with `agents-md` and `llms`, which gives the repo an internal agent surface and a public-safe surface by default. After that, most teams mainly use `build`, `sync`, and `check`.

## build
Runs the configured repo through the AgentCtx compiler.

```bash
agentctx build
```

By default, `agentctx build` reads `agentctx.config.ts`, indexes the configured repo scope, extracts facts, builds the context graph, selects context files, and writes compiled outputs into `.agentctx`.

Output layout:
- Workspace:
  - `.agentctx/workspace/context/*.md`
  - `.agentctx/workspace/out/*`
- CtxPoints:
  - `.agentctx/points/<point>/context/*.md`
  - `.agentctx/points/<point>/out/*`

## sync
Syncs built outputs into repo locations, preserving manual edits outside protected blocks.

```bash
agentctx sync
agentctx sync --point frontend
agentctx sync --point backend
agentctx sync --point infra
```

`sync` is likely the command teams use most often. Different teams can own different CtxPoints:

- infra teams can sync infrastructure and operations context
- frontend teams can sync frontend context
- backend teams can sync API, worker, or service context
- platform teams can sync shared contracts or package context

Default sync copies workspace outputs into the repo root and point outputs into each configured point path. Scoped sync with `--point` or `--points` narrows the operation to the team-owned domains plus the workspace entrypoint.

## check
Validates drift (workspace + points) and stale synced outputs.

```bash
agentctx check
agentctx check --point frontend
```

Useful flags:
- `--point <name>`
- `--points a,b,c`

Use `check` day to day as the owner of a CtxPoint. It detects when generated context is stale or when repo facts have drifted from the last build. CI should also run it, but the fastest feedback comes from each team checking the domain they own.

## Repo scripts

This repo exposes the CLI through root scripts:

- `pnpm context:build`
- `pnpm context:sync`
- `pnpm context:check`

In this repo, `context:sync` is a thin wrapper around `agentctx sync`.

## Advanced commands

These commands and flags are useful for framework authors, platform teams, and advanced users debugging generated context. Most consuming teams do not need them in the normal loop.

### build flags

- `--cwd <dir>`
- `--changed`
- `--dry-run`
- `--targets agents-md,claude,cursor,copilot,llms`
- `--point <name>`
- `--points a,b,c`
- `--category frontend,backend`
- `--file routes,api`

### plan
Inspects the context-file generation plan without writing outputs.

Examples:
- `agentctx plan`
- `agentctx plan --point frontend`
- `agentctx plan --json`

The output groups selected files and skipped files with a short reason.

### explain
Explains why one context file is generated or skipped.

Examples:
- `agentctx explain --file routes`
- `agentctx explain --point frontend --file api-client`
- `agentctx explain --file secrets --json`
