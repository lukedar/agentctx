# AgentCtx Bench

<div class="docs-hero">
  <span class="docs-kicker">Operational benchmarking</span>
  <h1>Measure the impact of operational context on AI engineering workflows.</h1>
  <p class="docs-lead">
    AgentCtx Bench compares no-context workflows against AgentCtx operational-context workflows across real repositories and realistic engineering tasks.
  </p>
</div>

## Benchmark Targets

| Target | Purpose | Tasks |
|---|---|---:|
| React | Frontend framework complexity across packages, fixtures, scheduler, reconciler, and release infrastructure. | 3 |
| Backend + Infra | Service boundaries, runtime dependencies, data contracts, infrastructure, observability, and security. | 3 |

## Run

```bash
pnpm run benchmark:metrics
```

Generated dashboard:

```text
.agentctx/bench/reports/index.html
```

Published data:

```text
docs-agentctx/public/benchmark/results.json
```

## Proof Focus

Bench Metrics is focused on operational scope efficiency:

- load the right Context Points
- exclude unnecessary operational domains
- reduce token usage
- reduce runtime
- reduce irrelevant edits
- preserve task success
