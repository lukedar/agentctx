# Context Points

<div class="docs-hero">
  <span class="docs-kicker">Operational domains</span>
  <h1>Bound context to the part of the system the task actually touches.</h1>
  <p class="docs-lead">
    A Context Point is a bounded operational domain inside a software system: frontend, API, worker, shared contracts, database, or infra.
  </p>
</div>

## Why They Matter

Without Context Points, agents load entire repositories. That creates large prompts, irrelevant context, hallucinated ownership, and unsafe changes.

With Context Points, agents load the operational domain relevant to the task. That improves token efficiency, task focus, monorepo scalability, and safety.

## Examples

<div class="docs-grid">
  <div class="docs-card docs-span-4"><h3>frontend</h3><p>Routes, components, state, styling, forms, accessibility, and API clients.</p></div>
  <div class="docs-card docs-span-4"><h3>api</h3><p>Handlers, auth, validation, middleware, errors, and database access.</p></div>
  <div class="docs-card docs-span-4"><h3>worker</h3><p>Jobs, queues, scheduling, retries, idempotency, and observability.</p></div>
  <div class="docs-card docs-span-4"><h3>shared-contracts</h3><p>Exports, schemas, public APIs, compatibility, usage, and versioning.</p></div>
  <div class="docs-card docs-span-4"><h3>database</h3><p>Schema, migrations, queries, seed data, and data-access rules.</p></div>
  <div class="docs-card docs-span-4"><h3>infra</h3><p>Deployments, environments, secrets, CI/CD, and permissions.</p></div>
</div>

## Context Mesh

Context Points become more useful when AgentCtx can model relationships between them:

```text
frontend -> api -> database
worker -> queue -> api
shared-contracts -> frontend, api, worker
```

The mesh helps agents reason about repositories more like senior engineers do: by understanding dependency direction, runtime communication, shared contracts, and cross-system change rules.
