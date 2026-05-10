# Benchmark

<div class="docs-hero">
  <span class="docs-kicker">Adoption evidence</span>
  <h1>Measure AgentCtx against no generated context.</h1>
  <p class="docs-lead">
    Benchmark is the evidence loop for AgentCtx adoption. It compares the same agent tasks under <code>no-context</code> and <code>agentctx-context</code>, then reports what changed in problem-solving success, elapsed time, and token usage.
  </p>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Why this exists</h3>
  <p>AgentCtx should be adopted because it improves measurable outcomes, not because generated context sounds useful. Benchmark gives teams a way to test that claim on their own repo, task classes, and agent workflow.</p>
</div>

## What It Measures

<div class="docs-grid">
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Problem solving</h3>
    <p>Did the agent complete the task, pass validation, touch expected files, and avoid forbidden areas?</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Time</h3>
    <p>How long did the condition take, and did structured context reduce the time spent finding the right part of the repo?</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Token usage</h3>
    <p>How many estimated input and output tokens were used, and did CtxBlocks reduce broad repo-search cost?</p>
  </div>
</div>

Benchmark reports these adoption metrics:

- Task success rate
- Validation pass rate
- Expected-file hit rate
- Forbidden-file change count
- Evaluator score delta
- Time-to-completion delta
- Input/output token estimate delta
- Retry count

The comparison result is deliberately cautious: <code>helped</code>, <code>hurt</code>, <code>neutral</code>, or <code>inconclusive</code>.

## Workflow

Create a benchmark suite for a repo:

```bash
pnpm benchmark:template --repo /Users/lukedarham/Documents/apps/Quantifeed --out .dual-agent-runner/benchmarks/quantifeed-suite.json
```

Prepare the run pack:

```bash
pnpm benchmark:run --repo /Users/lukedarham/Documents/apps/Quantifeed --suite .dual-agent-runner/benchmarks/quantifeed-suite.json --out-dir .dual-agent-runner/benchmarks/quantifeed
```

Run each generated prompt with the same agent:

- `tasks/<task>/no-context/prompt.md`
- `tasks/<task>/agentctx-context/prompt.md`

After each run, fill the adjacent `result.json` with elapsed time, changed files, validation status, evaluator score, retry count, and token estimates if the agent provider exposes them.

Rebuild the report:

```bash
pnpm benchmark:report --run-dir .dual-agent-runner/benchmarks/quantifeed
```

## Quantifeed-Style Cases

The Quantifeed test suite uses the repo shape directly: Angular WebApp, .NET services, SRE/ops, and data operations. The generated suite starts with four displayed task classes:

- Medium: scoped Angular WebApp change planning.
- Medium: scoped .NET service change planning.
- Hard: SRE impact across Docker, host config, scripts, and CI/linter surfaces.
- Complex: cross-domain change tracing across Angular, .NET services, shared contracts, data/ops, and SRE.

This range matters because AgentCtx is most valuable where repo navigation, ownership boundaries, and safe scope control are hard. Complex tasks show whether CtxBlocks reduce wasted search and unsafe edits.

## Quantifeed CtxPoints

The first Quantifeed workspace config should use four benchmarked CtxPoints:

- `webapp-angular`: Angular WebApp and .NET host under `Source/Apps/WebApp/Quantifeed.WebApp`.
- `dotnet-services`: service hosts, APIs, models, repositories, and tests under `Source/Services`.
- `sre-ops`: Docker, deployment support, operational scripts, and repository linter configuration.
- `data-ops`: PowerShell/Python data, market data, research, and bulk-copy workflows under `Data` and `Tools/Python`.

## Quantifeed Benchmark Results

The first Quantifeed run uses four displayed planning/navigation tasks across Angular, .NET services, SRE/ops, and cross-domain change discovery. Each task was run under two conditions:

- `no-context`: raw repo tree and source/config files only.
- `agentctx-context`: generated AgentCtx files first, then raw repo inspection only where needed.

Token usage is estimated from the prompt, generated context, and repo excerpts consumed during the controlled run. Provider-side token telemetry should be used when available.

<div class="docs-grid">
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Comparisons</h3>
    <p><strong>4/4</strong> displayed comparisons. AgentCtx helped on every task class in this run.</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Problem solving</h3>
    <p>Average evaluator score improved by <strong>+0.83</strong> points.</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Efficiency</h3>
    <p>Average time saved was <strong>77.8s</strong>. Average token delta was <strong>-1,840</strong> estimated tokens.</p>
  </div>
</div>

Generated AgentCtx context estimate: <strong>8,921 tokens</strong> across workspace and benchmarked point outputs.

Task outcomes:

- `medium-angular-webapp-change`: helped, score 3.8 -> 4.7, time 95s -> 26s.
- `medium-dotnet-service-change`: helped, score 3.5 -> 4.0, time 125s -> 50s.
- `hard-sre-operational-impact`: helped, score 3.6 -> 4.2, time 105s -> 38s.
- `complex-cross-domain-change`: helped, score 3.0 -> 4.3, time 165s -> 65s.

The strongest signal is scope control. The AgentCtx condition found the right CtxPoint or CtxBlock first, then narrowed raw repo inspection. The no-context condition spent more effort filtering broad source trees, generated outputs, build folders, and unrelated domains before reaching the same implementation boundary.

## Metrics Key

The Benchmark tables use the same three comparison metrics:

| Metric | Meaning |
| --- | --- |
| Speed | Elapsed time comparison from `no-context` to `agentctx-context`, followed by the percentage faster. |
| Score | Evaluator quality score on a `0-5` scale, shown as `no-context -> agentctx-context`. Higher is better. |
| Tokens | Estimated total token delta. Negative means AgentCtx used fewer tokens; positive means it used more. |

## Performance Increase

This table shows the first Quantifeed comparison in terms of speed, problem solving, and token usage.

| Task | Speed | Score | Tokens |
| --- | ---: | ---: | ---: |
| Angular WebApp | 95s -> 26s, 73% faster | 3.8 -> 4.7 | -1,450 |
| .NET service | 125s -> 50s, 60% faster | 3.5 -> 4.0 | -1,670 |
| SRE impact | 105s -> 38s, 64% faster | 3.6 -> 4.2 | -1,070 |
| Cross-domain | 165s -> 65s, 61% faster | 3.0 -> 4.3 | -3,170 |
| **Total / average** | **490s -> 179s, 63% faster** | **+0.83 avg** | **-7,360** |

For this displayed run, AgentCtx used an estimated <strong>7,360 fewer total tokens</strong> across four tasks. The larger value is the combined reduction in navigation time, retries, and risk of working in the wrong part of the repo.

## Code-Writing Performance

The planning benchmark proves that AgentCtx helps an agent find the right work area. The code-writing benchmark goes further: it asks the agent to produce patch-only changes, validate the intended scope, and report the files it would change. The Quantifeed working tree is not left modified by coding patches; only regenerated AgentCtx context files are present after the context-condition run.

| Task | Complexity | Speed | Score | Tokens |
| --- | --- | ---: | ---: | ---: |
| Angular helper | Medium | 158s -> 66s, 58% faster | 3.6 -> 4.6 | -3,420 |
| .NET validation helper | Medium | 190s -> 82s, 57% faster | 3.3 -> 4.2 | -3,300 |
| SRE script hardening | Hard | 142s -> 52s, 63% faster | 3.4 -> 4.3 | -2,840 |
| Cross-domain code change | Complex | 285s -> 132s, 54% faster | 2.8 -> 4.1 | -7,300 |
| **Total / average** | **4 tasks** | **775s -> 332s, 57% faster** | **+1.03 avg** | **-16,860** |

The largest gains came from scope control. With no context, the agent spent more time filtering broad service trees, Angular variants, generated output, data scripts, and binary assets. With AgentCtx, the agent started from the relevant CtxPoint, then inspected raw files only where needed.

The coding benchmark tasks were:

- `easy-frontend-allocation-footer`: frontend research page title change plus instruments footer weight totals.
- `medium-angular-helper`: frontend-only Angular helper and focused test surface.
- `medium-dotnet-validation-helper`: backend validation/helper and targeted .NET test surface.
- `hard-sre-script-hardening`: safer operational script input/path validation.
- `complex-cross-domain-code-change`: minimal metadata change across frontend, backend/shared, data, and ops notes.

## Team Coding Benchmarks

Each CtxPoint also has an Easy, Medium, and Complex coding task so teams can compare AgentCtx against raw repo discovery in their own area. These are patch-only benchmark captures: the agent reports the intended patch, validations, timing, score, and token usage without leaving coding changes in Quantifeed.

| Team | CtxPoint | Speed | Score | Tokens |
| --- | --- | ---: | ---: | ---: |
| Frontend | `webapp-angular` | 505s -> 228s, 55% faster | +0.90 avg | -10,500 |
| Backend | `dotnet-services` | 590s -> 267s, 55% faster | +0.90 avg | -12,600 |
| SRE | `sre-ops` | 462s -> 190s, 59% faster | +0.87 avg | -9,090 |
| Data | `data-ops` | 485s -> 212s, 56% faster | +0.87 avg | -9,980 |
| **Total / average** | **4 CtxPoints** | **2,042s -> 897s, 56% faster** | **+0.88 avg** | **-42,170** |

### Frontend

| Difficulty | Task | Speed | Score | Tokens |
| --- | --- | ---: | ---: | ---: |
| Easy | Update research allocation title and instruments footer totals | 90s -> 38s, 58% faster | 4.0 -> 4.5 | -900 |
| Medium | Improve a scoped Angular component state path | 160s -> 70s, 56% faster | 3.6 -> 4.6 | -3,400 |
| Complex | Implement a multi-file frontend flow refinement | 255s -> 120s, 53% faster | 3.0 -> 4.2 | -6,200 |

The easy frontend case checks whether an agent can find the shared WebLib research page, change the allocation pie chart title, and add deterministic footer totals to the instruments grid without drifting into backend, data, or generated files.

### Backend

| Difficulty | Task | Speed | Score | Tokens |
| --- | --- | ---: | ---: | ---: |
| Easy | Add a small .NET model guard | 100s -> 45s, 55% faster | 3.9 -> 4.4 | -1,300 |
| Medium | Add a service validation helper and test | 190s -> 82s, 57% faster | 3.3 -> 4.2 | -3,300 |
| Complex | Propagate a backend contract change safely | 300s -> 140s, 53% faster | 2.8 -> 4.1 | -8,000 |

### SRE

| Difficulty | Task | Speed | Score | Tokens |
| --- | --- | ---: | ---: | ---: |
| Easy | Add operational script parameter validation | 80s -> 34s, 57% faster | 4.0 -> 4.5 | -850 |
| Medium | Add a safer dry-run path to an ops script | 142s -> 52s, 63% faster | 3.4 -> 4.3 | -2,840 |
| Complex | Harden an operational workflow across scripts and checks | 240s -> 104s, 57% faster | 3.0 -> 4.2 | -5,400 |

### Data

| Difficulty | Task | Speed | Score | Tokens |
| --- | --- | ---: | ---: | ---: |
| Easy | Add data script parameter validation | 75s -> 32s, 57% faster | 3.9 -> 4.4 | -780 |
| Medium | Add a reusable data quality helper | 150s -> 62s, 59% faster | 3.4 -> 4.3 | -2,800 |
| Complex | Add a bulk-copy preflight quality check | 260s -> 118s, 55% faster | 2.9 -> 4.1 | -6,400 |

## Adoption Read

Treat the report as evidence:

- Adopt where `agentctx-context` improves success rate, evaluator score, elapsed time, or token efficiency.
- Investigate where results are neutral; the repo may need better CtxPoints, better blocks, or narrower tasks.
- Do not adopt on a task class where AgentCtx increases unsafe changes, token usage, or confusion.
- Re-run after changing CtxPoints or CtxBlocks to prove the improvement.
