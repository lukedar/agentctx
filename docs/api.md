# API

`dual-agent-runner` is intentionally small and functional.

## Core types
- `RunnerTask`
- `DecisionRecord`
- `EvaluationResult`
- `ReviewScore`, `ScoreDimension`, `ReviewStatus`

## Scoring
- `evaluateScores(scores)`
- `calculateAverageScore(scores)`
- `createEvaluationResult({...})`

## Token usage
- `estimateTokens(text)`
- `createTokenUsageMetrics(inputText, outputText, threshold)`

## Guardrails
- `DEFAULT_SECRET_PATTERNS`
- `DEFAULT_IGNORE_DIRS`
- `redactSensitiveValue(value)`
- `matchesGlob(path, pattern)`

## Reporting
- `renderDecisionRecordMarkdown(record)`
- `renderEvaluationResultMarkdown(result)`
- `renderRunReportMarkdown({ task, decisions, evaluations })`

## Events / UI model
- `RunnerEvent`, `RunnerEventType`
- `RunnerUiModel`
- `reduceRunnerUiModel(model, event)`
