# Token usage guardrails

`tokenUsage` is a first-class score dimension.

Evaluator must reject:
- repeated context across multiple outputs without a reason
- outputs that are clearly too large for the task
- prompts that include full source when summaries are enough

Defaults:
- internal token-usage thresholds

Metrics:
- `createTokenUsageMetrics(inputText, outputText, threshold)`
