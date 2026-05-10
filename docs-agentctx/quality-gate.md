# Dual Agent Runner

<div class="docs-hero">
  <span class="docs-kicker">Quality loop</span>
  <h1>AgentCtx uses a two-pass workflow to keep delivery fast, visible, and trustworthy.</h1>
  <p class="docs-lead">Make the change, evaluate the change, and only then move forward.</p>
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

## What the Builder sets

Before a meaningful change, the Builder records the decision it is about to make and the expected effect of that decision.

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Decision context</h3>
    <p>Decision, reason, files affected, alternatives considered, and risks.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Expected effects</h3>
    <p>Performance, token usage, usability, readability, and security.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Task frame</h3>
    <p>Goal, constraints, success criteria, likely files, and risk level.</p>
  </div>
</div>

This gives the Evaluator something concrete to check. The Builder is not only changing files; it is stating what tradeoff it expects the change to make.

## What the Evaluator checks

The Evaluator reviews the Builder decision and implementation against deterministic checks, safety conditions, and score thresholds.

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Deterministic checks</h3>
    <p>Typecheck, test, and build must pass before the step is treated as complete.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Blocking conditions</h3>
    <p>Unsafe changes, secret exposure, needless complexity, non-deterministic output, and excessive dependencies block progress.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Score thresholds</h3>
    <p>Any score below 3 fails. Average below 4 requires revision. Security or token usage below 4 requires revision.</p>
  </div>
</div>

Evaluator score dimensions:

- correctness
- testability
- security
- performance
- token usage
- usability
- readability
- simplicity
- maintainability

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
