# Bench Metrics

## Context Precision

Definition: how much loaded operational context was required.

Formula:

```text
required loaded Context Points / loaded Context Points
```

Interpretation: higher precision means less prompt waste and less reasoning noise.

## Context Recall

Definition: how much required operational context was loaded.

Formula:

```text
required loaded Context Points / required Context Points
```

Interpretation: high recall means important operational domains were not missed.

## Context Waste

Definition: unnecessary operational context loaded for a task.

Formula:

```text
unnecessary loaded Context Points / loaded Context Points
```

Interpretation: lower waste means smaller prompts and more focused context.

## Token Reduction

Definition: token usage reduction compared with the no-context condition.

Formula:

```text
(no-context tokens - AgentCtx tokens) / no-context tokens
```

## Runtime Reduction

Definition: runtime reduction compared with the no-context condition.

Formula:

```text
(no-context runtime - AgentCtx runtime) / no-context runtime
```

## Performance

Definition: overall operational efficiency improvement.

Formula:

```text
average(token reduction, runtime reduction, context precision delta, irrelevant edit reduction)
```

## Success Rate

Definition: successful completion under the benchmark validation criteria.

Formula:

```text
passing task runs / total task runs
```

## Irrelevant Edits

Definition: edits outside the expected operational scope.

Formula:

```text
files outside required Context Points
```
