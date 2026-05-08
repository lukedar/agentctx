# Architecture

This runner uses a **dual-agent** pipeline:

- **Builder**: does the work
- **Evaluator**: audits the work against a scored rubric

The key property is the **gate**: if evaluation fails, the Builder must fix and re-run checks.

<RunnerArchitectureDiagram />

## What flows through the pipeline

- **Inputs**: task + constraints + repo context
- **Outputs**: decision records, evaluations, scores, metrics, and a final report

## Internal pipeline notes

- Scoring includes: correctness, security, performance, readability, usability, token usage, and distribution readiness.
- The pipeline is compatible with an append-only event stream for local-first observability (UI is optional).
