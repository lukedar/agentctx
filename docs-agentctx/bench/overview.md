# AgentCtx Bench

<div class="docs-hero">
  <span class="docs-kicker">Evidence layer</span>
  <h1>Measure whether structured context improves agent outcomes.</h1>
  <p class="docs-lead">
    AgentCtx Bench testing framework compares agent work with no generated context against work that starts from operational context.
  </p>
</div>

## Why Benchmarks Matter

AgentCtx Bench measures whether operational context improves task success, token usage, runtime, operational correctness, file accuracy, and security findings.

## What It Measures

- task success
- token usage
- runtime
- evaluator score movement
- agent compute: retries, tool calls, provider latency
- operational correctness
- file accuracy
- Context Point test coverage
- security findings
- irrelevant edits
- reproducibility notes

## Mock Validation Suite

The repo includes three committed benchmark fixtures for validating the Bench framework itself:

```bash
pnpm run benchmark:mock
```

For parser-only validation:

```bash
pnpm -C packages/dual-agent-runner build
node packages/dual-agent-runner/dist/cli.js benchmark run --suite ./bench/suites/agentctx-core-validation.md --dry-run
```

The suite writes the reporting surface to:

```text
.agentctx/bench/reports/index.html
```

Each task also gets a run report and coverage page:

```text
.agentctx/bench/runs/<task-id>/index.html
.agentctx/bench/runs/<task-id>/coverage/index.html
```

## Methodology

Each benchmark should record:

- the task prompt
- the repo fixture
- the context point
- the selected context files or pack
- the agent/tooling used
- the raw evidence
- known limitations

The mock suite is deterministic and exists to prove reporting, task parsing, suite execution, token summaries, and Context Point coverage. Real benchmark runs should replace the mock condition results with captured agent execution evidence.

## Example Result Shape

| Metric | No Context | AgentCtx |
|---|---:|---:|
| Success | 42% | 82% |
| Tokens | 92k | 38k |
| Runtime | 14m | 8m |
| Context Point Coverage | 2/5 | 5/5 |
| Security Findings | 3 | 0 |

These numbers are illustrative. AgentCtx should publish benchmark evidence with methodology and limitations instead of vague productivity claims.

## Report Page

The generated reports index is designed for senior engineering review. It shows:

- task and difficulty coverage across small, medium, and complex cases
- no-context versus AgentCtx-context token usage
- runtime saved by starting from generated context
- evaluator score delta
- retries, tool calls, and provider latency where available
- Context Point coverage links for changed files and mapped tests
- public-safe and security findings for cross-cutting tasks

## Why Bench Exists

Context infrastructure must prove that it improves outcomes. Bench turns AgentCtx from a positioning claim into a measurable engineering system.
