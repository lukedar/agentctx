# Getting started

## Install
Once published:

```bash
pnpm add -D dual-agent-runner
# or
npm i -D dual-agent-runner
```

## The pattern
A task runs as a loop:

1. Builder proposes a Decision Record
2. Evaluator scores it (including **tokenUsage**)
3. Builder revises if needed
4. Builder implements
5. Evaluator reviews the implementation

## Minimal usage
Use the library to standardize artifacts (types, scoring rules, prompts, reports).

```ts
import {
  createBuilderPrompt,
  createEvaluatorPrompt,
  evaluateScores,
} from 'dual-agent-runner'
```

For Copilot, see the Prompts page.

## Enforcing the dual-agent gate (recommended)

To ensure every future development run gets an Evaluator pass, enforce a deterministic “gate” in **CI** and as a local habit.

In this repo you can run:

```bash
pnpm da:eval
```

This will:
- run `pnpm -r typecheck`, `pnpm -r test`, `pnpm -r build`
- generate `.dual-agent-runner/reports/dev-eval.md`
- exit non-zero if the evaluation status is not **PASS**
