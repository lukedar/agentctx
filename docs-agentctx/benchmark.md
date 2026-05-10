# Benchmark

<div class="docs-hero">
  <span class="docs-kicker">Evidence loop</span>
  <h1>Measure AgentCtx against no generated context.</h1>
  <p class="docs-lead">
    Benchmark prepares controlled task runs so teams can compare the same agent task with no generated context and with a selected AgentCtx CtxBlock.
  </p>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Principle</h3>
  <p>The framework should prove outcomes on a real repo. It reports whether AgentCtx helped, hurt, was neutral, or produced an inconclusive result for one task, one CtxBlock, and one agent workflow.</p>
</div>

## What It Tests

Benchmark v1 prepares two conditions:

| Condition | Rule |
| --- | --- |
| `no-context` | The agent must not use `AGENTS.md`, `.agentctx/context`, or generated AgentCtx files. |
| `agentctx-context` | The agent starts from the selected generated CtxBlock, then inspects source files only as needed. |

The command does not execute the agent directly. It creates prompts and result files that can be run by any agent.

## Create A Run Pack

Run the command after AgentCtx has generated context for the repo:

```bash
pnpm benchmark:ctxblock \
  --repo /path/to/repo \
  --ctx-block frontend \
  --task-name "Update research allocation title" \
  --task-prompt "Find the Allocation chart title and change it to This is a test."
```

The selected CtxBlock must exist at:

```text
<repo>/.agentctx/context/<ctx-block>.md
```

Use `--ctx-file <file>` when the test name should differ from the generated CtxBlock filename. For example, a test can be called `WebApp` while reading `frontend.md`.

The generated structure is:

```text
.dual-agent-runner/benchmarks/<ctxBlock>/<taskSlug>/
  benchmark.json
  no-context/
    prompt.md
    result.json
  agentctx-context/
    prompt.md
    result.json
  report.md
  report.json
```

## Capture Results

Run each `prompt.md` with the same agent and update the adjacent `result.json`.

| Metric | Meaning |
| --- | --- |
| `elapsedMs` | Wall-clock time for the agent run. |
| `inputTokens`, `outputTokens`, `totalTokens` | Provider token telemetry when available, or estimated tokens when telemetry is unavailable. |
| `agentCompute` | Model, retries, tool calls, reasoning effort, and provider latency where available. |
| `checksPassed` | Whether the task validation passed. |
| `evaluatorScore` | Quality score from `0-5`. |
| `scopeMisses` | Files or areas touched outside the intended task scope. |

Rebuild the comparison report after filling both result files:

```bash
pnpm benchmark:report --run-dir /path/to/repo/.dual-agent-runner/benchmarks/frontend/update-research-allocation-title
```

## Interpret Results

Benchmark reports one outcome:

| Outcome | Meaning |
| --- | --- |
| `helped` | AgentCtx improved validation, score, speed, token usage, or compute cost enough to be meaningful. |
| `hurt` | AgentCtx made the task worse, slower, more expensive, or less correct. |
| `neutral` | Both conditions completed without a decisive difference. |
| `inconclusive` | One or both result files are incomplete or missing enough evidence. |

Use the report as an engineering signal, not a blanket claim. If results are neutral or inconclusive, improve the CtxBlock, narrow the task, or rerun with better telemetry.
