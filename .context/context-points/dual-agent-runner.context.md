---
artifact: agentCtx_context_point
id: dual-agent-runner
name: Dual Agent Runner
version: 1
generated_at: unknown
primary_paths:
  - packages/dual-agent-runner
related_paths: 
  - packages/dual-agent-runner/dist/index.d.ts
  - packages/dual-agent-runner/dist/index.js
  - packages/dual-agent-runner/node_modules/.bin/tsc
detected_languages:
  - JavaScript
  - JSON
  - Markdown
  - TypeScript
detected_frameworks:
  - TypeScript
  - Vitest
risk_level: medium
confidence: high
---

# Context Point: Dual Agent Runner

## Purpose

Dual Agent Runner groups operational context for packages/dual-agent-runner.

## Scope

### Owns

- packages/dual-agent-runner

### Does Not Own

- Unrelated repository areas outside the listed primary paths.

## Start Here

| Path | Why It Matters | Common Task |
| --- | --- | --- |
| packages/dual-agent-runner/dist/index.d.ts | Representative entry point or metadata for this area. | Inspect before making changes in this Context Point. |
| packages/dual-agent-runner/dist/index.js | Representative entry point or metadata for this area. | Inspect before making changes in this Context Point. |
| packages/dual-agent-runner/node_modules/.bin/tsc | Representative entry point or metadata for this area. | Inspect before making changes in this Context Point. |

## Coding Flow

- Inspect the nearest existing implementation first.
- Make the smallest scoped change.
- Run the listed commands or report why they are unavailable.

## Interfaces

| Interface | Connected Context Point | Direction | Breakage Risk | Evidence |
| --- | --- | --- | --- | --- |
| None | None | None | None | None |

## Common Code Changes

| Change Type | Inspect First | Likely Edit Locations | Required Tests/Checks | Risk |
| --- | --- | --- | --- | --- |
| Behavior change | packages/dual-agent-runner | packages/dual-agent-runner | pnpm --dir packages/dual-agent-runner/node_modules/tsup build, pnpm --dir packages/dual-agent-runner build, pnpm --dir packages/dual-agent-runner/node_modules/tsup dev, pnpm --dir packages/dual-agent-runner/node_modules/tsup test, pnpm --dir packages/dual-agent-runner test, pnpm --dir packages/dual-agent-runner typecheck | medium |

## Commands

```bash
pnpm --dir packages/dual-agent-runner/node_modules/tsup build
pnpm --dir packages/dual-agent-runner build
pnpm --dir packages/dual-agent-runner/node_modules/tsup dev
pnpm --dir packages/dual-agent-runner/node_modules/tsup test
pnpm --dir packages/dual-agent-runner test
pnpm --dir packages/dual-agent-runner typecheck
```

## Patterns to Follow

- Match nearby code organization and naming.

## Rules and Constraints

- Prefer existing local patterns before introducing new abstractions.
- Keep changes scoped to the Context Point unless an interface requires wider edits.

## Security-Relevant Rules

- Do not copy secrets into generated context.
- Review configuration and environment handling before changing runtime behavior.

## Sharp Edges

- Generated context is a guide, not a replacement for inspecting current source.
- Validation commands may be incomplete when package scripts are missing.

## Change Protocol

1. Inspect the nearest existing implementation or test.
2. Identify affected interfaces and consumers.
3. Make the smallest correct change.
4. Update tests, generated artifacts, schemas, docs, or fixtures if required.
5. Run targeted checks first.
6. Run broader checks if shared boundaries changed.
7. Report changed files, validation results, and residual risk.

## Done When

- The requested behavior is implemented.
- Relevant tests or checks pass, or missing checks are reported.
- Interfaces remain compatible or consumers are updated.
- Generated artifacts are updated through the repo-approved process, if applicable.
- Final handoff names changed files, checks run, and remaining risks.

## Evidence

| Claim | Repository Evidence |
| --- | --- |
| Dual Agent Runner is represented by packages/dual-agent-runner. | packages/dual-agent-runner/dist/index.d.ts, packages/dual-agent-runner/dist/index.js, packages/dual-agent-runner/node_modules/.bin/tsc |

## Unknowns

- None.

## Refresh Triggers

- primary paths move
- validation commands change
- tests move
- dependency boundaries change
- generated-code process changes
