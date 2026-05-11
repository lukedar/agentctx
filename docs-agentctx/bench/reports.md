# Bench Reports

<div class="docs-hero">
  <span class="docs-kicker">Operational proof</span>
  <h1>AgentCtx Bench dashboard.</h1>
  <p class="docs-lead">
    Proof dashboard for real agent runs against React and .NET codebases.
  </p>
</div>

## Evidence Status

| Status | Meaning |
|---|---|
| Pending real agent run | No public metrics are published until agents complete the tasks against local React and .NET repo copies. |

## Aggregate Hero Summary

| Metric | No context | AgentCtx context | Delta |
|---|---:|---:|---:|
| Token Usage | pending real run | pending real run | not published |
| Runtime | pending real run | pending real run | not published |
| Performance | pending real run | pending real run | not published |
| Context Precision | pending real run | pending real run | not published |
| Success Rate | pending real run | pending real run | not published |
| Irrelevant Edits | pending real run | pending real run | not published |

## Benchmark Matrix: React

| Task | Field | Value |
|---|---|---|
| Add React test metadata summary | Complexity | 5+ days |
| Add React test metadata summary | Context Precision | pending real run |
| Add React test metadata summary | Performance Delta | not published |
| Add React test metadata summary | Status | real run required |
| Add package Context Point mapping | Complexity | 10+ days |
| Add package Context Point mapping | Context Precision | pending real run |
| Add package Context Point mapping | Performance Delta | not published |
| Add package Context Point mapping | Status | real run required |
| Add cross-package regression benchmark | Complexity | 15+ days |
| Add cross-package regression benchmark | Context Precision | pending real run |
| Add cross-package regression benchmark | Performance Delta | not published |
| Add cross-package regression benchmark | Status | real run required |

## Benchmark Matrix: .NET Backend

| Task | Field | Value |
|---|---|---|
| Add service command summary | Complexity | 5+ days |
| Add service command summary | Context Precision | pending real run |
| Add service command summary | Performance Delta | not published |
| Add service command summary | Status | real run required |
| Add API-to-data Context Mesh map | Complexity | 10+ days |
| Add API-to-data Context Mesh map | Context Precision | pending real run |
| Add API-to-data Context Mesh map | Performance Delta | not published |
| Add API-to-data Context Mesh map | Status | real run required |
| Add infrastructure-aware operational context report | Complexity | 15+ days |
| Add infrastructure-aware operational context report | Context Precision | pending real run |
| Add infrastructure-aware operational context report | Performance Delta | not published |
| Add infrastructure-aware operational context report | Status | real run required |

## React

| Aggregate | Value |
|---|---:|
| Tasks | 3 |
| Context Points covered | pending real run |
| Average precision | not published |
| Average performance | not published |

| Task | Required Context Points | Selected Context Points | Verification |
|---|---|---|---|
| Add React test metadata summary | `tests` | pending real run | React test command required |
| Add package Context Point mapping | `react-core`, `react-dom`, `shared` | pending real run | React package verification required |
| Add cross-package regression benchmark | `scheduler`, `react-reconciler`, `react-dom`, `shared`, `fixtures`, `release-infra` | pending real run | React regression verification required |

## .NET Backend

| Aggregate | Value |
|---|---:|
| Tasks | 3 |
| Context Points covered | pending real run |
| Average precision | not published |
| Average performance | not published |

| Task | Required Context Points | Selected Context Points | Verification |
|---|---|---|---|
| Add service command summary | `app-host` | pending real run | `dotnet test` required |
| Add API-to-data Context Mesh map | `api-services`, `contracts`, `database` | pending real run | `dotnet test` and `dotnet build` required |
| Add infrastructure-aware operational context report | `api-services`, `workers`, `database`, `infra`, `observability`, `security`, `tests` | pending real run | `dotnet test` and `dotnet build` required |

## Required Evidence Fields

| Evidence | Requirement |
|---|---|
| Agent command identity | The report must name the agent command or agent runner used. |
| Target repo path and commit | The report must identify the local React or .NET repo copy and commit. |
| Condition result files | Both no-context and AgentCtx-context result files must exist. |
| Changed files | The runner must detect actual file changes in the repo copy. |
| Forbidden files | The runner must confirm forbidden files were not touched. |
| Verification output | Repo verification commands must pass. |
| Token usage | Published only when the agent exposes real token usage. |
| Runtime | Measured from the real condition execution. |
| Context metrics | Precision, recall, and waste are computed from real selected Context Points. |

## Generated Outputs

```text
.agentctx/bench/reports/index.html
.agentctx/bench/reports/react/*.html
.agentctx/bench/reports/dotnet/*.html
docs-agentctx/public/benchmark/results.json
```

This page intentionally does not publish benchmark numbers until the runs are produced by real agent execution against local React and .NET codebases.
