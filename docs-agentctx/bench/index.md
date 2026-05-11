# AgentCtx Bench

<div class="docs-hero">
  <span class="docs-kicker">Operational benchmarking</span>
  <h1>Benchmark testing framework for evaluating operational context.</h1>
  <p class="docs-lead">
    AgentCtx Bench compares no-context workflows against AgentCtx operational-context workflows across realistic senior engineering tasks.
  </p>
</div>

## Framework Overview

AgentCtx Bench is the evidence layer for the AgentCtx framework. It checks whether generated operational context helps an agent load the right repository domains, avoid unrelated files, reduce token usage, reduce runtime, and still complete the task.

Each task runs under two conditions:

| Condition | Input |
|---|---|
| No context | Task file and minimal repository instructions. |
| AgentCtx context | Task file plus operational context, Context Points, selected blocks, and exclusions. |

## Benchmark Targets

| Target | Purpose | Tasks |
|---|---|---:|
| React | Frontend framework complexity across packages, fixtures, scheduler, reconciler, and release infrastructure. | 3 |
| Backend + Infra | Service boundaries, runtime dependencies, data contracts, infrastructure, observability, and security. | 3 |

## Task Complexity

| Complexity | Expected work | Operational scope |
|---|---:|---|
| Small | 5+ days | 1 Context Point |
| Medium | 10+ days | 2-3 Context Points |
| Large | 15+ days | 4+ Context Points |

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

## Scope Model

Bench measures required, selected, and excluded Context Points. That lets reports show whether AgentCtx loaded the operational domains that mattered while excluding unnecessary repository areas.

The framework tracks:

- required Context Points for the task
- Context Points loaded without AgentCtx
- Context Points loaded with AgentCtx
- excluded Context Points
- changed files and mapped test files
- scope misses and irrelevant edits

## Metrics

| Metric | Definition | Formula |
|---|---|---|
| Context Precision | How much loaded operational context was required. | `required loaded Context Points / loaded Context Points` |
| Context Recall | How much required operational context was loaded. | `required loaded Context Points / required Context Points` |
| Context Waste | Unnecessary operational context loaded for a task. | `unnecessary loaded Context Points / loaded Context Points` |
| Token Reduction | Token usage reduction against no-context execution. | `(no-context tokens - AgentCtx tokens) / no-context tokens` |
| Runtime Reduction | Runtime reduction against no-context execution. | `(no-context runtime - AgentCtx runtime) / no-context runtime` |
| Performance | Overall operational efficiency improvement. | `average(token reduction, runtime reduction, context precision delta, irrelevant edit reduction)` |
| Success Rate | Successful completion under benchmark validation criteria. | `passing task runs / total task runs` |
| Irrelevant Edits | Edits outside expected operational scope. | `files outside required Context Points` |

Higher Context Precision and Context Recall are better. Lower Context Waste, token usage, runtime, and irrelevant edits are better.

## Report Contract

The generated report is intentionally shaped like a coding test runner:

- an aggregate hero summary across all tasks
- a benchmark matrix by target and task
- one task title followed by one concise comparison table
- Context Point coverage for changed files and tests
- public JSON for docs and downstream analysis

## Limitations

The current metrics suite uses deterministic mock evidence so the reports, formulas, dashboards, and task model can be validated reproducibly. Real agent executions can replace the condition result files without changing the report contract.
