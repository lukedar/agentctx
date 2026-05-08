# Performance guardrails

Performance is a first-class quality dimension.

Evaluator must reject:
- full-repo reads when manifests/configs are enough
- scanning ignored directories
- slow synchronous loops over huge repos when incremental/indexed approaches work

Useful primitive:
- `shouldRescanFile(previous, current)` (in `guards.ts`)
