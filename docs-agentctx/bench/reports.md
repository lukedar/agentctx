# Bench Reports

<div class="docs-hero">
  <span class="docs-kicker">Benchmark evidence</span>
  <h1>Senior task ladder across every Context Point.</h1>
  <p class="docs-lead">
    Medium, large, and very-large benchmark tasks for core, CLI, adapters, targets, the dual-agent runner, and docs. The suite shows aggregate no-context versus AgentCtx-context performance before drilling into each Context Point.
  </p>
</div>

## Test Run Summary

| Status | Tests | Passed | Outcome |
|---|---:|---:|---|
| complete | 18 | 18 | AgentCtx improved runtime, token usage, and coverage across the full senior-dev ladder. |

## Hero Report Summary

| Suite Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Total tokens | 294,000 | 152,880 | 141,120 `+48.0%` |
| Total runtime | 6,552.0s | 3,528.0s | 3,024.0s `+46.2%` |

## Context Point Coverage

| Context Point | Status | Bench tasks | Changed files | Mapped tests | Task coverage |
|---|---|---:|---:|---:|---|
| `adapters` | covered | 3 | 1 | 1 | framework detector, monorepo composition, plugin evidence pipeline |
| `cli` | covered | 3 | 1 | 1 | bench command UX, explainable workflow output, workflow orchestration |
| `core` | covered | 3 | 1 | 1 | capability metadata, capability weighting, versioned fact visibility |
| `docs-agentctx` | covered | 3 | 1 | 1 | methodology, report examples, evidence narrative |
| `dual-agent-runner` | covered | 3 | 1 | 1 | aggregate scoring, suite coverage links, benchmark lifecycle |
| `targets` | covered | 3 | 1 | 1 | rendering parity, public-safe filtering, compatibility migration |

## Core: Add Typed Context Point Capability Metadata

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 7,000 | 3,640 | 3,360 `+48.0%` |
| Runtime | 156.0s | 84.0s | 72.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 12 | 6 | -6 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Core: Redesign Context Block Selection with Capability Weighting

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 14,000 | 7,280 | 6,720 `+48.0%` |
| Runtime | 312.0s | 168.0s | 144.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 16 | 8 | -8 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Core: Introduce Versioned Fact Visibility and Graph Contracts

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 28,000 | 14,560 | 13,440 `+48.0%` |
| Runtime | 624.0s | 336.0s | 288.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 24 | 12 | -12 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## CLI: Add Bench Command UX

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 7,000 | 3,640 | 3,360 `+48.0%` |
| Runtime | 156.0s | 84.0s | 72.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 12 | 6 | -6 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## CLI: Add Explainable Build Sync Check Workflow Output

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 14,000 | 7,280 | 6,720 `+48.0%` |
| Runtime | 312.0s | 168.0s | 144.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 16 | 8 | -8 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## CLI: Add Multi-step Repo Workflow Orchestration

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 28,000 | 14,560 | 13,440 `+48.0%` |
| Runtime | 624.0s | 336.0s | 288.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 24 | 12 | -12 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Adapters: Add Framework Detector Fixture

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 7,000 | 3,640 | 3,360 `+48.0%` |
| Runtime | 156.0s | 84.0s | 72.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 12 | 6 | -6 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Adapters: Add Monorepo Adapter Composition

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 14,000 | 7,280 | 6,720 `+48.0%` |
| Runtime | 312.0s | 168.0s | 144.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 16 | 8 | -8 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Adapters: Add Plugin Evidence Pipeline

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 28,000 | 14,560 | 13,440 `+48.0%` |
| Runtime | 624.0s | 336.0s | 288.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 24 | 12 | -12 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Targets: Add Target Rendering Parity Checks

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 7,000 | 3,640 | 3,360 `+48.0%` |
| Runtime | 156.0s | 84.0s | 72.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 12 | 6 | -6 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Targets: Add Public-safe Filtering Across Targets

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 14,000 | 7,280 | 6,720 `+48.0%` |
| Runtime | 312.0s | 168.0s | 144.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 16 | 8 | -8 |
| Context Point coverage | 0/1 | 1/1 | +1 |
| Public-safe validation | unchecked | passed | passed |

## Targets: Add Target Compatibility Migration Tests

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 28,000 | 14,560 | 13,440 `+48.0%` |
| Runtime | 624.0s | 336.0s | 288.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 24 | 12 | -12 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Dual-agent Runner: Add Aggregate Benchmark Scoring

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 7,000 | 3,640 | 3,360 `+48.0%` |
| Runtime | 156.0s | 84.0s | 72.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 12 | 6 | -6 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Dual-agent Runner: Add Suite Coverage Links

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 14,000 | 7,280 | 6,720 `+48.0%` |
| Runtime | 312.0s | 168.0s | 144.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 16 | 8 | -8 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Dual-agent Runner: Add Benchmark Lifecycle Reporting

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 28,000 | 14,560 | 13,440 `+48.0%` |
| Runtime | 624.0s | 336.0s | 288.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 24 | 12 | -12 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Docs: Add Benchmark Methodology Docs

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 7,000 | 3,640 | 3,360 `+48.0%` |
| Runtime | 156.0s | 84.0s | 72.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 12 | 6 | -6 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Docs: Add Generated Report Examples

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 14,000 | 7,280 | 6,720 `+48.0%` |
| Runtime | 312.0s | 168.0s | 144.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 16 | 8 | -8 |
| Context Point coverage | 0/1 | 1/1 | +1 |

## Docs: Add Full Benchmark Evidence Narrative

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Status | completed | completed | helped |
| Tokens | 28,000 | 14,560 | 13,440 `+48.0%` |
| Runtime | 624.0s | 336.0s | 288.0s `+46.2%` |
| Evaluator score | 3.3 | 4.4 | +1.1 |
| Tool calls | 24 | 12 | -12 |
| Context Point coverage | 0/1 | 1/1 | +1 |

The suite uses deterministic mock evidence to validate Bench itself. Real agent runs can replace the mock condition results without changing the report contract.
