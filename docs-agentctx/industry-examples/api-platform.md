# API Platform

<div class="docs-hero">
  <span class="docs-kicker">Medium-high priority</span>
  <h1>APIs, OpenAPI, SDKs, contracts, public docs, and <code>llms.txt</code>.</h1>
  <p class="docs-lead">API platforms need both internal engineering context and clean public-safe AI surfaces for external developers and docs crawlers.</p>
</div>

## System Overview

An API platform usually includes API services, OpenAPI contracts, SDKs, examples, versioning policy, auth, docs, and support paths. Some context is useful publicly; some must stay internal.

## Typical Repository Structure

```text
services/api
openapi
sdks/typescript
sdks/dotnet
docs
examples
packages/contracts
```

## Common AI Context Problems

- SDK changes drift from OpenAPI contracts
- public docs miss versioning or auth constraints
- internal runbooks leak into public-safe context surfaces
- agents update examples without contract awareness
- token-heavy docs bury the relevant endpoint context

## Recommended Context Points

- `api`
- `contracts`
- `sdks`
- `docs`
- `examples`

## Example Context Mesh

```text
contracts -> api
contracts -> sdks
api -> docs
sdks -> examples
```

## Recommended Context Surfaces

- `AGENTS.md` for internal service, contract, and release rules
- `llms.txt` for compact public orientation
- future `llms-full.txt` for richer public docs bundles
- future `public-manifest.json` for public context inventory

## Example Task-aware Context Planning

Task: add a public response field.

Loaded:

- `api.md`
- `public-api.md`
- `compatibility.md`
- `versioning.md`
- `testing.md`

Excluded:

- deployment runbooks
- private incident notes
- unrelated SDK internals

## Benchmark Example

| Metric | No Context | AgentCtx |
|---|---:|---:|
| Tokens | 74k | 22k |
| Runtime | 11m | 6m |
| Contract drift | 3 | 0 |
| Public-safe issues | 2 | 0 |

## Where AgentCtx Adds Value

AgentCtx lets API teams publish public-safe AI context while keeping internal release, security, and operational workflows scoped to internal agents.
