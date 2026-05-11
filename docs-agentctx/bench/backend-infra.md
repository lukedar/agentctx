# Backend + Infra Benchmark

The backend + infrastructure benchmark models service and runtime dependency complexity.

## Context Points

- `app-host`
- `api-services`
- `workers`
- `database`
- `contracts`
- `infra`
- `observability`
- `security`
- `tests`

## Tasks

| Complexity | Task | Required Context Points |
|---|---|---|
| Small | Add service command summary | `app-host` |
| Medium | Add API-to-data Context Mesh map | `api-services`, `contracts`, `database` |
| Large | Add infrastructure-aware operational context report | `api-services`, `workers`, `database`, `infra`, `observability`, `security`, `tests` |

## What It Proves

The backend suite measures whether AgentCtx can isolate service boundaries, data contracts, runtime dependencies, infrastructure concerns, observability, and security constraints without loading unrelated repository areas.
