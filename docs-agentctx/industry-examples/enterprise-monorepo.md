# Enterprise Monorepo

<div class="docs-hero">
  <span class="docs-kicker">Medium-high priority</span>
  <h1>Governance, visibility boundaries, token scale, and affected context.</h1>
  <p class="docs-lead">Enterprise monorepos make context coordination an infrastructure problem: hundreds of packages, multiple teams, shared ownership, and strict review gates.</p>
</div>

## System Overview

Enterprise repos combine applications, services, shared packages, contracts, infra, data workflows, docs, and test tooling. Agents need context by ownership boundary, not by repository size.

## Typical Repository Structure

```text
apps
services
packages
workers
infra
data
docs
```

## Common AI Context Problems

- agents load too much context and miss the relevant boundary
- shared package changes under-plan downstream impact
- public and internal visibility rules are mixed
- affected build and test paths are unclear
- review agents cannot detect stale context reliably

## Recommended Context Points

- `frontend`
- `backend`
- `platform`
- `infra`
- `data`
- `shared-contracts`

## Example Context Mesh

```text
shared-contracts -> apps, services, workers
platform -> apps, services
infra -> deployments
data -> services, analytics
```

## Recommended Context Surfaces

- workspace `AGENTS.md`
- point-level `AGENTS.md` for team-owned areas
- public-safe `llms.txt`
- `check` in CI for context drift

## Benchmark Example

| Metric | No Context | AgentCtx |
|---|---:|---:|
| Tokens | 160k | 48k |
| Runtime | 22m | 12m |
| Affected-domain misses | 8 | 2 |
| Irrelevant edits | 14 | 3 |

## Where AgentCtx Adds Value

AgentCtx makes enterprise operational context ownable, governable, and measurable instead of treating a monorepo as a single prompt.
