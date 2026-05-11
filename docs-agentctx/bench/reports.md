# Bench Reports

<div class="docs-hero">
  <span class="docs-kicker">Benchmark evidence</span>
  <h1>AgentCtx performance and token usage reports.</h1>
  <p class="docs-lead">
    Mock validation results for the committed small, medium, and complex benchmark tasks. These reports prove the Bench pipeline can parse tasks, run both conditions, generate coverage, and publish senior-developer metrics.
  </p>
</div>

## Current Suite

```bash
pnpm run benchmark:mock
```

Generated local report:

```text
.agentctx/bench/reports/index.html
```

Published data:

```text
docs-agentctx/public/benchmark/results.json
```

## Executive Metrics

| Task | Outcome | No-context tokens | AgentCtx tokens | Token reduction | Runtime saved | Context Point coverage |
|---|---|---:|---:|---:|---:|---:|
| Add Token Summary to Bench JSON Report | helped | 3,500 | 1,820 | 48.0% | 36.0s | 1/1 |
| Add Context Point Coverage to Bench Reports | helped | 7,000 | 3,640 | 48.0% | 72.0s | 2/2 |
| Add Public-safe Context Validation to Bench and CLI | helped | 10,500 | 5,460 | 48.0% | 108.0s | 4/4 |

## Coverage

| Task | Covered Context Points | Coverage Notes |
|---|---:|---|
| Small | 1/1 | `dual-agent-runner` changes are mapped to runner benchmark tests. |
| Medium | 2/2 | `core` and `dual-agent-runner` changes are mapped to package-level tests. |
| Complex | 4/4 | `core`, `cli`, `targets`, and `dual-agent-runner` are covered, including public-safe validation evidence. |

## Report Contract

Each generated report includes:

- `tokenSummary`
- `coverageByContextPoint`
- `testCoverageSummary`
- `securityFindings`
- `publicSafeValidation`
- per-condition runtime, tokens, retries, tool calls, provider latency, changed files, evaluator score, and scope misses

The mock suite is deterministic. Use it to validate Bench itself; use real agent runs to produce production-grade benchmark evidence.
