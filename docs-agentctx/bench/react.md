# React Benchmark

The React benchmark models frontend framework complexity.

## Context Points

- `react-core`
- `react-dom`
- `react-reconciler`
- `scheduler`
- `shared`
- `tests`
- `fixtures`
- `release-infra`

## Tasks

| Complexity | Task | Required Context Points |
|---|---|---|
| Small | Add React test metadata summary | `tests` |
| Medium | Add package Context Point mapping | `react-core`, `react-dom`, `shared` |
| Large | Add cross-package regression benchmark | `scheduler`, `react-reconciler`, `react-dom`, `shared`, `fixtures`, `release-infra` |

## What It Proves

The React suite measures whether operational context narrows a broad frontend framework repository into the exact package, fixture, scheduler, reconciler, and release domains needed for a task.
