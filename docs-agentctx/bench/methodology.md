# Bench Methodology

AgentCtx Bench compares two conditions for every task:

| Condition | Input |
|---|---|
| No context | Task file and minimal repository instructions. |
| AgentCtx context | Task file plus operational context, Context Points, selected blocks, and exclusions. |

## Task Complexity

| Complexity | Expected work | Operational scope |
|---|---:|---|
| Small | 5+ days | 1 Context Point |
| Medium | 10+ days | 2-3 Context Points |
| Large | 15+ days | 4+ Context Points |

## Scope Measurement

Bench measures required, selected, and excluded Context Points. That allows reports to show whether AgentCtx loaded the operational domains that mattered while excluding unnecessary repository areas.

## Limitations

The current metrics suite uses deterministic mock evidence so the reports, formulas, dashboards, and task model can be validated reproducibly. Real agent executions can replace the condition result files without changing the report contract.
