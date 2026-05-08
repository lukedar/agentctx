# Dual Agent Runner

<div class="docs-hero">
  <span class="docs-kicker">Evaluator gate</span>
  <h1>Use the dual-agent loop to keep changes deterministic and reviewable.</h1>
  <p class="docs-lead">The Builder makes the change. The Evaluator checks it against the repo’s quality bar. The gate exists to keep iteration visible while work is still in progress.</p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-6 docs-card--accent">
    <h3>Builder / Evaluator</h3>
    <p>One agent implements the task, the other scores the result and flags regressions before they land.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Gate command</h3>
    <p><code>pnpm da:eval</code> runs typecheck, tests, and build in a deterministic repo-wide pass.</p>
  </div>
</div>

## Internal pipeline

<img src="/diagrams/dual-agent-pipeline.svg" alt="Dual Agent Runner internal pipeline diagram" />

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Plan</h3>
    <p>A task plan defines the ordered steps the runner will execute and evaluate.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Score</h3>
    <p>The Evaluator scores each step and records the outcome in the step report.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Advance</h3>
    <p>Only a passed step can move forward to the next step in the plan.</p>
  </div>
</div>

## What the gate enforces

The gate is the repo’s default validation path.

Run it locally with:

```bash
pnpm da:eval
```

That command runs:
- `pnpm -r typecheck`
- `pnpm -r test`
- `pnpm -r build`

The result is a deterministic report that records pass/fail status for the whole repo.

## Step-based execution

For multi-step work, the runner supports a plan file and ordered step execution.

```bash
pnpm da:plan:template > my-task.plan.json
pnpm da:step --plan-file my-task.plan.json
```

This workflow:
- stores state in `.dual-agent-runner/tasks/<taskId>/state.json`
- writes Builder and Evaluator prompts for the active step
- evaluates the current step before allowing the next step to run
- records per-step reports under `.dual-agent-runner/tasks/<taskId>/steps/`

If a step fails, revise the implementation and rerun the same command. When the step passes, the next invocation advances automatically.

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Plan</h3>
    <p>Create a task plan for multi-step work so the runner can evaluate one step at a time.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Implement</h3>
    <p>The Builder edits the code, while the Evaluator scores each step and flags issues.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Advance</h3>
    <p>Only move to the next step after the active one passes.</p>
  </div>
</div>

## Runner output

The runner writes its repo-wide evaluation report to:

```text
.dual-agent-runner/reports/dev-eval.md
```

It also keeps the JSON report that powers this docs page:

```text
.dual-agent-runner/reports/dev-eval.json
```

## Latest evaluation

<DualAgentMetricsTable />

## Local docs endpoint

For local development, the docs site can expose a button-backed evaluation endpoint.

Enable it with:

```bash
DAR_DOCS_EXEC=1 pnpm -C docs-agentctx dev --host 127.0.0.1 --port 5174
```

That enables:
- `POST /__dar/status`
- `POST /__dar/eval`

The evaluation endpoint runs `pnpm da:eval` in the repo root and then syncs the latest report into `docs-agentctx/public/dual-agent-runner/dev-eval.json`.

## Where the data comes from

The docs page reads these artifacts:
- `.dual-agent-runner/reports/dev-eval.json`
- `.dual-agent-runner/tasks/<taskId>/state.json`
- `.dual-agent-runner/tasks/<taskId>/steps/*.json`

The docs sync script copies the latest report into:
- `docs-agentctx/public/dual-agent-runner/dev-eval.json`

This keeps the page deterministic in both `dev` and `build`.

## CI behavior

CI runs the same gate through `pnpm da:eval`.

If the evaluation status is not `PASS`, the workflow fails.

That makes the gate the same in local development and in automation.

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Why it matters</h3>
  <p>AgentCtx changes how a repo is summarized for agents. A bad change can mean worse context and wasted iteration, so the gate stays visible throughout the workflow.</p>
</div>

## How a team should use it

Recommended loop:
1. Make a small change.
2. If the work is part of a planned task, run `pnpm da:step --plan-file <plan.json>`.
3. Fix any failing step and rerun until it passes.
4. For one-off changes, run `pnpm da:eval` before pushing.
5. Let CI rerun the same gate.

## Troubleshooting

If the gate fails, the report usually points to one of three areas:
- typecheck errors
- test failures
- build failures

After fixing the issue, rerun:

```bash
pnpm da:eval
```

## Why it matters

AgentCtx changes how a repo is summarized for agents.

That means the cost of a bad change is not just a broken build. It can also mean worse context, worse prompts, and wasted token capacity. The dual-agent runner exists to keep those failures visible while work is still in progress.
