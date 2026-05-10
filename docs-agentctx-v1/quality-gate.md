# Dual Agent Runner

<div class="docs-hero">
  <span class="docs-kicker">Quality loop</span>
  <h1>Use a two-pass workflow to keep delivery fast, visible, and trustworthy.</h1>
  <p class="docs-lead">Dual Agent Runner is not just a command. It is a way of working: make the change, evaluate the change, and only then move forward.</p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-6 docs-card--accent">
    <h3>Builder</h3>
    <p>Implements the change in small, reviewable steps.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Evaluator</h3>
    <p>Checks the result against the repo quality bar before progress is accepted.</p>
  </div>
</div>

## Why it exists

AgentCtx changes how a repo is interpreted by tools and agents. That raises the cost of sloppy changes:
- bad context creates bad downstream decisions
- hidden regressions waste iteration time
- unstable outputs make reviews harder

The runner exists to make quality explicit instead of assumed.

## The mindset

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Small steps</h3>
    <p>Break work into narrow changes that can be evaluated quickly.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Visible quality</h3>
    <p>Do not trust progress that has not been checked by the same gate every time.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Fast feedback</h3>
    <p>Find drift, breakage, and weak assumptions before they spread through the repo.</p>
  </div>
</div>

This is the core loop:
1. Make a focused change.
2. Evaluate it with the same deterministic gate.
3. Fix issues before moving on.
4. Repeat until the task is done.

## Step-based work

For larger changes, use the runner as a step gate instead of one final check.

```bash
pnpm da:plan:template > my-task.plan.json
pnpm da:step --plan-file my-task.plan.json
```

That workflow keeps the work disciplined:
- one step is active at a time
- each step is evaluated before the next one starts
- reports are written as the task progresses

This keeps long-running work from turning into one large, hard-to-review diff.

## What teams get from it

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Better reviews</h3>
    <p>Changes arrive with a clear quality trail instead of only a claim that they work.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Safer iteration</h3>
    <p>Refactors stay controlled because each step must pass before the next one lands.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Higher throughput</h3>
    <p>Fast feedback reduces rework and keeps failures local to the step that caused them.</p>
  </div>
</div>

## Reports and artifacts

Repo-wide evaluation reports are written to:

```text
.dual-agent-runner/reports/dev-eval.md
.dual-agent-runner/reports/dev-eval.json
```

Step-based tasks keep their state under:

```text
.dual-agent-runner/tasks/<taskId>/
```

These artifacts make the evaluation path inspectable instead of hidden.

## Recommended operating model

Use this as the default working pattern:
1. Start with the smallest useful change.
2. Run `pnpm da:step --plan-file <plan.json>` for planned work, or `pnpm da:eval` for one-off work.
3. Fix failures immediately.
4. Advance only when the current step passes.
5. Let CI rerun the same gate.

## Local docs endpoint

For local development, the docs site can expose a button-backed evaluation endpoint.

Enable it with:

```bash
DAR_DOCS_EXEC=1 pnpm -C docs-agentctx dev --host 127.0.0.1 --port 5174
```

That enables:
- `POST /__dar/status`
- `POST /__dar/eval`

The evaluation endpoint runs `pnpm da:eval` in the repo root and syncs the latest report into `docs-agentctx/public/dual-agent-runner/dev-eval.json`.
