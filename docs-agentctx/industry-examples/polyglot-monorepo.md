# Polyglot Monorepo

<div class="docs-hero">
  <span class="docs-kicker">Highest priority</span>
  <h1>Angular frontend, .NET API, Node workers, shared contracts, and infra.</h1>
  <p class="docs-lead">Polyglot monorepos are where raw prompts break down fastest: each task can cross languages, runtimes, ownership boundaries, and validation paths.</p>
</div>

## System Overview

A typical repo contains an Angular app, .NET API, Node background workers, shared contracts, and infrastructure code. The agent must know which layer owns routing, API shape, validation, queues, database access, and deployment behavior.

## Typical Repository Structure

<div class="docs-panel">
<pre><code>apps/web-angular
services/api-dotnet
workers/jobs-node
packages/shared-contracts
infra</code></pre>
</div>

## Common AI Context Problems

- frontend changes ignore API validation rules
- shared contract updates miss worker consumers
- .NET auth policies are hidden from UI tasks
- queue behavior is loaded for unrelated route changes
- agents waste tokens on generated build outputs and duplicated docs

## Recommended Context Points

- `frontend`
- `api`
- `worker`
- `shared-contracts`
- `infra`

## Example Context Mesh

<div class="docs-panel">
<pre><code>frontend -> api -> database
shared-contracts -> frontend, api, worker
worker -> queue -> api</code></pre>
</div>

## Recommended Context Surfaces

- `AGENTS.md` for repo-wide orientation
- point-level `AGENTS.md` files for team-owned domains
- `llms.txt` for public-safe platform orientation
- CI `check` output for drift detection

## Example Task-aware Context Planning

Task: update an auth error shown in the Angular app.

Loaded:

- `overview.md`
- `routes.md`
- `api.md`
- `security.md`
- `testing.md`

Excluded:

- `queues.md`
- `deployments.md`
- `database.md`

## Benchmark Example

| Metric | No Context | AgentCtx |
|---|---:|---:|
| Tokens | 92k | 38k |
| Runtime | 14m | 8m |
| Success | 42% | 82% |
| Irrelevant edits | 9 | 1 |

## Where AgentCtx Adds Value

AgentCtx turns framework diversity into explicit context rather than token pressure. Each adapter emits evidence for its own stack, while the compiler keeps the cross-system mesh visible to agents.
