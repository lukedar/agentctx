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

## Required Proof Matrix

| Repo | Task Family | Required Evidence |
|---|---|---|
| React | test metadata, package Context Point mapping, cross-package regression coverage | agent-completed file changes, React verification commands, result files, token/runtime data |
| .NET backend | service command summary, API-to-data context mesh, infrastructure-aware operational report | agent-completed file changes, `dotnet test`/`dotnet build`, result files, token/runtime data |

## Required Report Fields

- agent command identity
- target repo path and commit
- no-context result file
- AgentCtx-context result file
- actual changed files
- forbidden-file check
- verification command output
- token usage when the agent exposes it
- measured runtime
- Context Point precision, recall, and waste

## Generated Outputs

```text
.agentctx/bench/reports/index.html
.agentctx/bench/reports/react/*.html
.agentctx/bench/reports/backend-infra/*.html
docs-agentctx/public/benchmark/results.json
```

This page intentionally does not publish benchmark numbers until the runs are produced by real agent execution against local React and .NET codebases.
