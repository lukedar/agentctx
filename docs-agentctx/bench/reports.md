# Bench Reports

<div class="docs-hero">
  <span class="docs-kicker">Benchmark evidence</span>
  <h1>AgentCtx performance and token usage reports.</h1>
  <p class="docs-lead">
    Mock validation results for the committed small, medium, and complex benchmark tasks. These reports prove the Bench pipeline can parse tasks, run both conditions, generate coverage, and publish senior-developer metrics.
  </p>
</div>

## Test Run Summary

| Status | Tests | Passed | Outcome |
|---|---:|---:|---|
| complete | 3 | 3 | AgentCtx improved runtime, token usage, and coverage across all mock tasks. |

## Add Token Summary to Bench JSON Report

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 3,500 | 1,820 | 1,680 `+48.0%` |
| Runtime | 78.0s | 42.0s | 36.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 10 | 5 | -5 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Add Context Point Coverage to Bench Reports

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 7,000 | 3,640 | 3,360 `+48.0%` |
| Runtime | 156.0s | 84.0s | 72.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 12 | 6 | -6 |
| Context Point coverage | 0/2 | 2/2 | +2 |

## Add Public-safe Context Validation to Bench and CLI

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 10,500 | 5,460 | 5,040 `+48.0%` |
| Runtime | 234.0s | 126.0s | 108.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 14 | 7 | -7 |
| Context Point coverage | 0/4 | 4/4 | +4 |
| Public-safe validation | unchecked | passed | passed |

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
