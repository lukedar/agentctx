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
- operational correctness
- file accuracy
- security findings
- irrelevant edits
- reproducibility notes

## Methodology

Each benchmark should record:

- the task prompt
- the repo fixture
- the context point
- the selected context files or pack
- the agent/tooling used
- the raw evidence
- known limitations

## Example Result Shape

| Metric | No Context | AgentCtx |
|---|---:|---:|
| Success | 42% | 82% |
| Tokens | 92k | 38k |
| Runtime | 14m | 8m |
| Security Findings | 3 | 0 |

These numbers are illustrative. AgentCtx should publish benchmark evidence with methodology and limitations instead of vague productivity claims.

## Why Bench Exists

Context infrastructure must prove that it improves outcomes. Bench turns AgentCtx from a positioning claim into a measurable engineering system.
