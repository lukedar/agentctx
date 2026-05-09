{
  "task": {
    "id": "agentctx-context-benchmark",
    "title": "Build a focused AgentCtx adoption benchmark",
    "goal": "Create a local-first benchmark that measures whether AgentCtx-generated context improves coding-agent outcomes compared with running the same tasks with no generated context.",
    "constraints": [
      "Use this file as the Dual Agent Runner plan input",
      "Keep the first implementation focused on no-context versus agentctx-context only",
      "Measure real task outcomes, not marketing claims",
      "Keep benchmark execution local-first and deterministic where possible",
      "Do not introduce broad bench product surface area before the core comparison is proven",
      "Every implementation step must pass the dual-agent evaluation gate before continuing"
    ],
    "successCriteria": [
      "The benchmark defines comparable no-context and agentctx-context conditions",
      "The benchmark records objective metrics for each run",
      "The report explains whether AgentCtx helped, hurt, or made no difference for each task",
      "The output is credible enough to support an adoption conversation without overstating results",
      "The repo remains buildable, testable, and documented after each step"
    ],
    "filesLikelyAffected": [
      "packages/dual-agent-runner/src",
      "packages/dual-agent-runner/tests",
      "docs-agentctx/quality-gate.md",
      "docs-agentctx/pipeline.md",
      "package.json",
      "implementation-plan/005-AGENTCTX_BENCH_FROM_SCRATCH_EXECUTION_PLAN.md"
    ],
    "riskLevel": "medium"
  },
  "steps": [
    {
      "id": "step-01",
      "title": "Define the benchmark contract and evidence model",
      "instructions": "Replace the broad AgentCtx Bench concept with a focused benchmark contract for comparing two conditions: no-context and agentctx-context. Define the task model, condition model, run result model, and aggregate report model. Metrics must include task success, deterministic checks, files changed, expected-file hit rate, forbidden-file changes, elapsed time, estimated input/output tokens where available, context size, retry count, and evaluator score. The model must allow a result of helped, hurt, neutral, or inconclusive rather than assuming AgentCtx wins.",
      "successCriteria": [
        "Types or schemas exist for benchmark tasks, conditions, run results, metrics, and comparison summaries",
        "The only required initial conditions are no-context and agentctx-context",
        "The evidence model can represent negative and inconclusive outcomes",
        "Unit tests cover comparison scoring and status classification",
        "No framework-specific scoring is hardcoded into the benchmark core"
      ],
      "filesLikelyAffected": [
        "packages/dual-agent-runner/src",
        "packages/dual-agent-runner/tests"
      ]
    },
    {
      "id": "step-02",
      "title": "Add a realistic benchmark task format",
      "instructions": "Create a benchmark task format that describes a coding-agent task without embedding the answer. Each task should include title, goal, allowed files, expected files, forbidden files, validation commands, setup notes, and success rubric. Add at least three initial tasks that exercise different AgentCtx strengths: repo navigation, scoped code change, and safe documentation/config update. These tasks should be runnable against this repo first before adding external fixtures.",
      "successCriteria": [
        "Benchmark task files can be loaded and validated",
        "The initial task set covers navigation, scoped implementation, and config/docs safety",
        "Each task declares expected and forbidden file patterns",
        "Each task declares deterministic validation commands",
        "Tests reject malformed tasks"
      ],
      "filesLikelyAffected": [
        "packages/dual-agent-runner/src",
        "packages/dual-agent-runner/tests",
        ".dual-agent-runner/benchmarks"
      ]
    },
    {
      "id": "step-03",
      "title": "Implement condition materialisation",
      "instructions": "Implement the mechanics for preparing benchmark conditions. The no-context condition must run without generated AgentCtx instruction/context files. The agentctx-context condition must run after agentctx build/sync has produced the generated context. The implementation should use isolated temporary worktrees or copied workspaces so each condition starts from the same baseline and can be compared fairly.",
      "successCriteria": [
        "Both benchmark conditions are prepared from the same git baseline",
        "No-context removes or hides generated AgentCtx outputs without deleting the user's working tree",
        "AgentCtx-context runs with generated outputs present",
        "The condition setup is reversible and does not mutate unrelated repo files",
        "Tests cover condition path selection and safety guards"
      ],
      "filesLikelyAffected": [
        "packages/dual-agent-runner/src",
        "packages/dual-agent-runner/tests"
      ]
    },
    {
      "id": "step-04",
      "title": "Add metric capture and diff analysis",
      "instructions": "Capture metrics after each condition run. Record command results, elapsed time, changed files, expected-file hit rate, forbidden-file changes, line churn, generated context token estimate, prompt/context token estimate where available, and final evaluator score. Keep token metrics estimated when direct model telemetry is unavailable, and label them as estimates in the report.",
      "successCriteria": [
        "Metric capture works without model-provider telemetry",
        "Diff analysis identifies expected, unexpected, and forbidden file changes",
        "Token metrics clearly distinguish measured values from estimates",
        "Security checks flag secret-like additions in diffs or generated outputs",
        "Tests cover diff classification and aggregate metric calculation"
      ],
      "filesLikelyAffected": [
        "packages/dual-agent-runner/src",
        "packages/dual-agent-runner/tests"
      ]
    },
    {
      "id": "step-05",
      "title": "Render adoption-grade comparison reports",
      "instructions": "Create JSON and Markdown reports that compare no-context against agentctx-context per task and across the suite. The report should show the raw numbers first, then a cautious interpretation. It must identify where AgentCtx helped, where it did not help, and where the evidence is inconclusive. Include enough detail for engineering leaders to inspect the claim rather than trust a headline.",
      "successCriteria": [
        "Reports include per-task condition results and suite-level aggregates",
        "Reports include success rate, validation pass rate, expected-file hit rate, forbidden-change count, elapsed time, retry count, token estimates, and evaluator score deltas",
        "Reports include a helped/hurt/neutral/inconclusive classification with rationale",
        "Reports avoid unsupported adoption claims",
        "Report rendering is covered by tests"
      ],
      "filesLikelyAffected": [
        "packages/dual-agent-runner/src/report.ts",
        "packages/dual-agent-runner/tests/report.test.ts",
        ".dual-agent-runner/reports"
      ]
    },
    {
      "id": "step-06",
      "title": "Expose a minimal benchmark CLI",
      "instructions": "Add a minimal Dual Agent Runner command for the benchmark. Keep the initial command surface small: run a suite, compare conditions, and write JSON/Markdown reports. The command should accept a suite path, condition list, output directory, and check flag. Avoid adding fixture registries, HTML reports, SQLite, telemetry, or multiple framework adapters until the no-context versus agentctx-context comparison is proven useful.",
      "successCriteria": [
        "A CLI command can run the benchmark against a task suite",
        "The command supports no-context and agentctx-context conditions",
        "The command writes stable JSON and Markdown outputs",
        "The command exits non-zero with --check when comparison evidence fails configured thresholds",
        "CLI behavior is covered by tests where practical"
      ],
      "filesLikelyAffected": [
        "packages/dual-agent-runner/src/cli.ts",
        "packages/dual-agent-runner/src",
        "packages/dual-agent-runner/tests",
        "package.json"
      ]
    },
    {
      "id": "step-07",
      "title": "Document how to interpret benchmark results",
      "instructions": "Update the docs to explain the benchmark as an evidence loop, not a sales claim. Position it as a way to decide whether AgentCtx improves outcomes for a specific repo, task class, and agent. Show the metrics, the helped/hurt/neutral/inconclusive interpretation, and the limitations of local benchmarking.",
      "successCriteria": [
        "Docs explain why no-context is the first baseline",
        "Docs explain what each metric means",
        "Docs explain how to read helped, hurt, neutral, and inconclusive outcomes",
        "Docs connect the benchmark back to the any repo, any framework, any agent positioning",
        "Docs avoid overstating results before teams run their own suite"
      ],
      "filesLikelyAffected": [
        "docs-agentctx/quality-gate.md",
        "docs-agentctx/pipeline.md",
        "docs-agentctx/index.md"
      ]
    }
  ]
}
