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
| complete | 6 | 6 | AgentCtx improved runtime, token usage, and coverage across all mock tasks. |

## Hero Report Summary

| Suite Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Total tokens | 42,000 | 21,840 | 20,160 `+48.0%` |
| Total runtime | 936.0s | 504.0s | 432.0s `+46.2%` |

## Context Point Coverage

| Context Point | Status | Bench tasks | Changed files | Mapped tests | Task coverage |
|---|---|---:|---:|---:|---|
| `adapters` | covered | 2 | 1 | 1 | adapter smoke coverage, compiler integration |
| `cli` | covered | 2 | 1 | 1 | public-safe command, compiler command pathways |
| `core` | covered | 3 | 1 | 1 | Context Point coverage, public-safe validation, compiler integration |
| `docs-agentctx` | covered | 2 | 1 | 1 | benchmark reports page, docs command coverage |
| `dual-agent-runner` | covered | 5 | 1 | 1 | parser, runner, token summary, report generation, CLI/docs command |
| `targets` | covered | 3 | 1 | 1 | adapter smoke coverage, public-safe output, compiler integration |

## Add Token Summary to Bench JSON Report

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 3,500 | 1,820 | 1,680 `+48.0%` |
| Runtime | 78.0s | 42.0s | 36.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 10 | 5 | -5 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Add Adapter and Target Smoke Coverage

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 3,500 | 1,820 | 1,680 `+48.0%` |
| Runtime | 78.0s | 42.0s | 36.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 10 | 5 | -5 |
| Context Point coverage | 0/2 | 2/2 | +2 |

## Add Context Point Coverage to Bench Reports

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 7,000 | 3,640 | 3,360 `+48.0%` |
| Runtime | 156.0s | 84.0s | 72.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 12 | 6 | -6 |
| Context Point coverage | 0/2 | 2/2 | +2 |

## Add CLI and Docs Benchmark Command Coverage

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

## Validate Compiler Surface Integration Across Core Packages

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 10,500 | 5,460 | 5,040 `+48.0%` |
| Runtime | 234.0s | 126.0s | 108.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 14 | 7 | -7 |
| Context Point coverage | 0/6 | 6/6 | +6 |

## Coverage

| Task | Covered Context Points | Coverage Notes |
|---|---:|---|
| Small token summary | 1/1 | `dual-agent-runner` changes are mapped to runner benchmark tests. |
| Small adapter-target smoke | 2/2 | `adapters` and `targets` are covered together. |
| Medium context coverage | 2/2 | `core` and `dual-agent-runner` changes are mapped to package-level tests. |
| Medium CLI/docs command | 2/2 | `dual-agent-runner` and `docs-agentctx` are covered together. |
| Complex public-safe validation | 4/4 | `core`, `cli`, `targets`, and `dual-agent-runner` are covered, including public-safe validation evidence. |
| Complex compiler integration | 6/6 | all main Context Points are represented in one cross-surface task. |

## Report Contract

Each generated report includes:

- `tokenSummary`
- `coverageByContextPoint`
- `testCoverageSummary`
- `securityFindings`
- `publicSafeValidation`
- per-condition runtime, tokens, retries, tool calls, provider latency, changed files, evaluator score, and scope misses

The mock suite is deterministic. Use it to validate Bench itself; use real agent runs to produce production-grade benchmark evidence.
