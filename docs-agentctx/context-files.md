# Context Files

<div class="docs-hero">
  <span class="docs-kicker">v2 taxonomy</span>
  <h1>Small focused files instead of one giant context dump.</h1>
  <p class="docs-lead">
    AgentCtx v2 generates universal context for every scope and adds framework-specific files only when the repo has the signals to justify them.
  </p>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Compatibility</h3>
  <p>The v2 taxonomy turns repository evidence into operational context files. The docs now lead with context infrastructure: scoped, secure, token-aware context surfaces for AI systems.</p>
</div>

## Universal files

Every workspace or CtxPoint gets the same safety and orientation set:

- `overview.md`
- `architecture.md`
- `conventions.md`
- `commands.md`
- `dependencies.md`
- `testing.md`
- `security.md`
- `boundaries.md`

## Capability Files

AgentCtx detects capabilities from normalized facts. If a capability is not present, the file is skipped instead of generated empty.

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Frontend</h3>
    <p><code>routes</code>, <code>components</code>, <code>state</code>, <code>styling</code>, <code>accessibility</code>, <code>forms</code>, and <code>api-client</code>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Backend</h3>
    <p><code>api</code>, <code>auth</code>, <code>database</code>, <code>middleware</code>, <code>validation</code>, <code>errors</code>, and <code>observability</code>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Workers</h3>
    <p><code>jobs</code>, <code>queues</code>, <code>scheduling</code>, <code>retries</code>, and <code>idempotency</code>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Packages</h3>
    <p><code>exports</code>, <code>schemas</code>, <code>versioning</code>, <code>compatibility</code>, <code>public-api</code>, and <code>usage</code>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Data</h3>
    <p><code>schema</code>, <code>migrations</code>, <code>queries</code>, <code>seed-data</code>, and <code>data-access</code>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Infrastructure</h3>
    <p><code>deployments</code>, <code>environments</code>, <code>secrets</code>, <code>ci-cd</code>, and <code>permissions</code>.</p>
  </div>
</div>

## Load order

`AGENTS.md` stays compact and points agents at deeper files:

```text
1. .agentctx/context/overview.md
2. .agentctx/context/boundaries.md
3. .agentctx/context/security.md
4. .agentctx/context/architecture.md
5. .agentctx/context/commands.md
6. .agentctx/context/testing.md
```

Task-specific files are loaded only when relevant. A frontend routing task should add `routes.md` and `api-client.md`; an API task should add `api.md`, `auth.md`, `validation.md`, and `errors.md`.

## Why This Beats Raw Dumps

Context files are evidence-backed, task-aware, token-aware, visibility-aware, and operationally meaningful. They are designed to be consumed by agents as infrastructure, not guessed from raw file chunks.
