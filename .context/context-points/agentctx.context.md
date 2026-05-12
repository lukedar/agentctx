---
artifact: agentCtx_context_point
id: agentctx
name: Agentctx
version: 1
generated_at: unknown
primary_paths:
  - packages/agentctx
related_paths: 
  - packages/agentctx/dist/chunk-IJTA5T2F.js
  - packages/agentctx/dist/cli/cli.d.ts
  - packages/agentctx/dist/cli/cli.js
detected_languages:
  - JavaScript
  - JSON
  - Markdown
  - TypeScript
detected_frameworks:
  - Express
  - Jest
  - React
  - TypeScript
  - Vite
  - Vitest
risk_level: medium
confidence: high
---

# Context Point: Agentctx

## Purpose

Agentctx groups operational context for packages/agentctx.

## Scope

### Owns

- packages/agentctx

### Does Not Own

- Unrelated repository areas outside the listed primary paths.

## Start Here

| Path | Why It Matters | Common Task |
| --- | --- | --- |
| packages/agentctx/dist/chunk-IJTA5T2F.js | Representative entry point or metadata for this area. | Inspect before making changes in this Context Point. |
| packages/agentctx/dist/cli/cli.d.ts | Representative entry point or metadata for this area. | Inspect before making changes in this Context Point. |
| packages/agentctx/dist/cli/cli.js | Representative entry point or metadata for this area. | Inspect before making changes in this Context Point. |

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
| Behavior change | packages/agentctx | packages/agentctx | pnpm --dir packages/agentctx/node_modules/cac build, pnpm --dir packages/agentctx/node_modules/fast-glob build, pnpm --dir packages/agentctx/node_modules/pathe build, pnpm --dir packages/agentctx/node_modules/tsup build, pnpm --dir packages/agentctx/node_modules/zod build, pnpm --dir packages/agentctx build, pnpm --dir packages/agentctx/test/fixtures/basic-js build, pnpm --dir packages/agentctx/test/fixtures/frontend-api/apps/web build, pnpm --dir packages/agentctx/test/fixtures/frontend-api build, pnpm --dir packages/agentctx/test/fixtures/frontend-api/packages/contracts build, pnpm --dir packages/agentctx/node_modules/pathe dev, pnpm --dir packages/agentctx/node_modules/tsup dev, pnpm --dir packages/agentctx/test/fixtures/frontend-api/apps/web dev, pnpm --dir packages/agentctx/test/fixtures/frontend-api/services/api dev, pnpm --dir packages/agentctx/node_modules/fast-glob lint, pnpm --dir packages/agentctx/node_modules/fs-extra lint, pnpm --dir packages/agentctx/node_modules/pathe lint, pnpm --dir packages/agentctx/node_modules/cac test, pnpm --dir packages/agentctx/node_modules/fast-glob test, pnpm --dir packages/agentctx/node_modules/fs-extra test, pnpm --dir packages/agentctx/node_modules/pathe test, pnpm --dir packages/agentctx/node_modules/tsup test, pnpm --dir packages/agentctx/node_modules/zod test, pnpm --dir packages/agentctx test, pnpm --dir packages/agentctx/test/fixtures/basic-js test, pnpm --dir packages/agentctx/test/fixtures/frontend-api/apps/web test, pnpm --dir packages/agentctx/test/fixtures/frontend-api test, pnpm --dir packages/agentctx/test/fixtures/frontend-api/services/api test, pnpm --dir packages/agentctx typecheck | medium |

## Commands

```bash
pnpm --dir packages/agentctx/node_modules/cac build
pnpm --dir packages/agentctx/node_modules/fast-glob build
pnpm --dir packages/agentctx/node_modules/pathe build
pnpm --dir packages/agentctx/node_modules/tsup build
pnpm --dir packages/agentctx/node_modules/zod build
pnpm --dir packages/agentctx build
pnpm --dir packages/agentctx/test/fixtures/basic-js build
pnpm --dir packages/agentctx/test/fixtures/frontend-api/apps/web build
pnpm --dir packages/agentctx/test/fixtures/frontend-api build
pnpm --dir packages/agentctx/test/fixtures/frontend-api/packages/contracts build
pnpm --dir packages/agentctx/node_modules/pathe dev
pnpm --dir packages/agentctx/node_modules/tsup dev
pnpm --dir packages/agentctx/test/fixtures/frontend-api/apps/web dev
pnpm --dir packages/agentctx/test/fixtures/frontend-api/services/api dev
pnpm --dir packages/agentctx/node_modules/fast-glob lint
pnpm --dir packages/agentctx/node_modules/fs-extra lint
pnpm --dir packages/agentctx/node_modules/pathe lint
pnpm --dir packages/agentctx/node_modules/cac test
pnpm --dir packages/agentctx/node_modules/fast-glob test
pnpm --dir packages/agentctx/node_modules/fs-extra test
pnpm --dir packages/agentctx/node_modules/pathe test
pnpm --dir packages/agentctx/node_modules/tsup test
pnpm --dir packages/agentctx/node_modules/zod test
pnpm --dir packages/agentctx test
pnpm --dir packages/agentctx/test/fixtures/basic-js test
pnpm --dir packages/agentctx/test/fixtures/frontend-api/apps/web test
pnpm --dir packages/agentctx/test/fixtures/frontend-api test
pnpm --dir packages/agentctx/test/fixtures/frontend-api/services/api test
pnpm --dir packages/agentctx typecheck
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
| Agentctx is represented by packages/agentctx. | packages/agentctx/dist/chunk-IJTA5T2F.js, packages/agentctx/dist/cli/cli.d.ts, packages/agentctx/dist/cli/cli.js |

## Unknowns

- None.

## Refresh Triggers

- primary paths move
- validation commands change
- tests move
- dependency boundaries change
- generated-code process changes
