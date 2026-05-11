# Bench Reports

<div class="docs-hero">
  <span class="docs-kicker">Operational proof</span>
  <h1>AgentCtx Bench dashboard.</h1>
  <p class="docs-lead">
    Real-world benchmark evidence for React-style frontend complexity and backend + infrastructure operational complexity.
  </p>
</div>

## Aggregate Hero Summary

| Metric | Improvement |
|---|---:|
| Token Usage | `-48.0%` |
| Runtime | `-46.2%` |
| Performance | `+45.5%` |
| Context Precision | `+54.3%` |
| Success Rate | `+100.0%` |
| Irrelevant Edits | `+33.3%` |

## Benchmark Matrix

| Repo | Task | Complexity | Context Precision | Performance Δ | Tokens Δ | Runtime Δ | Status |
|---|---|---|---:|---:|---:|---:|---|
| React | Add React test metadata summary | 5+ days | 100.0% | +45.4% | -48.0% | -46.2% | green |
| React | Add package Context Point mapping | 10+ days | 100.0% | +39.2% | -48.0% | -46.2% | green |
| React | Add cross-package regression benchmark | 15+ days | 85.7% | +51.2% | -48.0% | -46.2% | green |
| Backend + Infra | Add service command summary | 5+ days | 100.0% | +45.8% | -48.0% | -46.2% | green |
| Backend + Infra | Add API-to-data Context Mesh map | 10+ days | 100.0% | +40.2% | -48.0% | -46.2% | green |
| Backend + Infra | Add infrastructure-aware operational context report | 15+ days | 87.5% | +51.0% | -48.0% | -46.2% | green |

## React

| Aggregate | Value |
|---|---:|
| Tasks | 3 |
| Context Points covered | 8 |
| Average precision | 95.2% |
| Average performance | +45.3% |

| Task | Required Context Points | Selected Context Points |
|---|---|---|
| Add React test metadata summary | `tests` | `tests` |
| Add package Context Point mapping | `react-core`, `react-dom`, `shared` | `react-core`, `react-dom`, `shared` |
| Add cross-package regression benchmark | `scheduler`, `react-reconciler`, `react-dom`, `shared`, `fixtures`, `release-infra` | `fixtures`, `react-core`, `react-dom`, `react-reconciler`, `release-infra`, `scheduler`, `shared` |

## Backend + Infra

| Aggregate | Value |
|---|---:|
| Tasks | 3 |
| Context Points covered | 9 |
| Average precision | 95.8% |
| Average performance | +45.7% |

| Task | Required Context Points | Selected Context Points |
|---|---|---|
| Add service command summary | `app-host` | `app-host` |
| Add API-to-data Context Mesh map | `api-services`, `contracts`, `database` | `api-services`, `contracts`, `database` |
| Add infrastructure-aware operational context report | `api-services`, `workers`, `database`, `infra`, `observability`, `security`, `tests` | `api-services`, `app-host`, `database`, `infra`, `observability`, `security`, `tests`, `workers` |

## Generated Outputs

```text
.agentctx/bench/reports/index.html
.agentctx/bench/reports/react/*.html
.agentctx/bench/reports/backend-infra/*.html
docs-agentctx/public/benchmark/results.json
```

The current suite uses deterministic mock execution evidence to validate the metrics, report contract, and dashboard. The same report schema accepts filled real-run result files when external repositories are cloned under `~/Documents/agentctx-test-repos/`.
