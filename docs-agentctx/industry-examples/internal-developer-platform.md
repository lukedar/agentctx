# Internal Developer Platform

<div class="docs-hero">
  <span class="docs-kicker">High priority</span>
  <h1>CI systems, deployments, observability, internal APIs, and infra.</h1>
  <p class="docs-lead">Internal platforms are operational systems. Agents need context about workflows, gates, permissions, and rollout paths before changing tooling used by other teams.</p>
</div>

## System Overview

An internal developer platform may include CI templates, deployment workflows, environment tooling, observability rules, internal APIs, infra modules, and developer documentation.

## Typical Repository Structure

```text
ci
deployments
observability
services/internal-api
infra
docs
```

## Common AI Context Problems

- CI template changes miss downstream consumers
- deployment edits ignore environment rules
- observability changes are made without alerting context
- infra context leaks into public docs
- agents cannot distinguish framework code from platform policy

## Recommended Context Points

- `ci`
- `deployments`
- `observability`
- `infra`
- `internal-api`

## Example Context Mesh

```text
ci -> deployments
deployments -> infra
internal-api -> observability
infra -> observability
```

## Recommended Context Surfaces

- `AGENTS.md` for platform operating rules
- point-level context for infra, CI, and deployments
- `check` as a CI quality gate for stale context
- public-safe docs only when platform APIs are exposed externally

## Example Task-aware Context Planning

Task: update deployment checks for a new service class.

Loaded:

- `commands.md`
- `workflows.md`
- `operations.md`
- `security.md`
- `testing.md`

Excluded:

- frontend routes
- database migrations
- public API docs

## Benchmark Example

| Metric | No Context | AgentCtx |
|---|---:|---:|
| Tokens | 86k | 29k |
| Runtime | 13m | 7m |
| Missed workflow rules | 5 | 1 |
| Drift findings caught | 0 | 4 |

## Where AgentCtx Adds Value

AgentCtx makes operational policy visible as operational context and turns context freshness into a workflow quality gate.
