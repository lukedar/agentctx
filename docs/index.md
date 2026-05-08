# dual-agent-runner

A local-first framework for running engineering tasks with a **Builder** and an **Evaluator**.

## Why
Senior teams adopt it to systematically enforce:
- performance and efficiency
- security and secret-safety
- readable, maintainable code
- token-usage-aware context shaping (for AI-agent contexts)

## What you get
- Decision Records + Evaluations
- a scoring rubric (incl. `tokenUsage`)
- guardrails (security/perf/token)
- an optional local UI dashboard

## Architecture
Walk through the internal Builder → Evaluator pipeline:
- [Architecture diagram](/architecture)
