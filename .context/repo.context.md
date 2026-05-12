---
artifact: agentCtx_repo_context
version: 1
generated_at: unknown
confidence: high
---

# Repository Context

## Purpose

AgentCtx operational context for agentctx-workspace.

## Repository Shape

| Context Point | Type | Primary Paths |
| --- | --- | --- |
| Agentctx | package | packages/agentctx |
| Docs | documentation-surface | docs |
| Dual Agent Runner | package | packages/dual-agent-runner |
| GitHub Workflows | ci-workflow | .github/workflows |

## Global Coding Rules

- Prefer existing local patterns.
- Keep generated context deterministic.
- Load only task-relevant Context Points.

## Package, Build, and Tooling

- `pnpm --dir packages/agentctx/node_modules/cac build` - Build project
- `pnpm --dir packages/agentctx/node_modules/fast-glob build` - Build project
- `pnpm --dir packages/agentctx/node_modules/pathe build` - Build project
- `pnpm --dir packages/agentctx/node_modules/tsup build` - Build project
- `pnpm --dir packages/agentctx/node_modules/zod build` - Build project
- `pnpm --dir packages/agentctx build` - Build project
- `pnpm --dir packages/agentctx/test/fixtures/basic-js build` - Build project
- `pnpm --dir packages/agentctx/test/fixtures/frontend-api/apps/web build` - Build project
- `pnpm --dir packages/agentctx/test/fixtures/frontend-api build` - Build project
- `pnpm --dir packages/agentctx/test/fixtures/frontend-api/packages/contracts build` - Build project
- `pnpm --dir packages/agentctx/node_modules/pathe dev` - Start development server
- `pnpm --dir packages/agentctx/node_modules/tsup dev` - Start development server
- `pnpm --dir packages/agentctx/test/fixtures/frontend-api/apps/web dev` - Start development server
- `pnpm --dir packages/agentctx/test/fixtures/frontend-api/services/api dev` - Start development server
- `pnpm --dir packages/agentctx/node_modules/fast-glob lint` - Run lint checks
- `pnpm --dir packages/agentctx/node_modules/fs-extra lint` - Run lint checks
- `pnpm --dir packages/agentctx/node_modules/pathe lint` - Run lint checks
- `pnpm --dir packages/agentctx/node_modules/cac test` - Run tests
- `pnpm --dir packages/agentctx/node_modules/fast-glob test` - Run tests
- `pnpm --dir packages/agentctx/node_modules/fs-extra test` - Run tests
- `pnpm --dir packages/agentctx/node_modules/pathe test` - Run tests
- `pnpm --dir packages/agentctx/node_modules/tsup test` - Run tests
- `pnpm --dir packages/agentctx/node_modules/zod test` - Run tests
- `pnpm --dir packages/agentctx test` - Run tests
- `pnpm --dir packages/agentctx/test/fixtures/basic-js test` - Run tests
- `pnpm --dir packages/agentctx/test/fixtures/frontend-api/apps/web test` - Run tests
- `pnpm --dir packages/agentctx/test/fixtures/frontend-api test` - Run tests
- `pnpm --dir packages/agentctx/test/fixtures/frontend-api/services/api test` - Run tests
- `pnpm --dir packages/agentctx typecheck` - Run type checks
- `pnpm --dir packages/dual-agent-runner/node_modules/tsup build` - Build project
- `pnpm --dir packages/dual-agent-runner build` - Build project
- `pnpm --dir packages/dual-agent-runner/node_modules/tsup dev` - Start development server
- `pnpm --dir packages/dual-agent-runner/node_modules/tsup test` - Run tests
- `pnpm --dir packages/dual-agent-runner test` - Run tests
- `pnpm --dir packages/dual-agent-runner typecheck` - Run type checks
- `pnpm build` - Build project
- `pnpm test` - Run tests
- `pnpm typecheck` - Run type checks

## Global Validation Strategy

- Run targeted checks first.
- Run broader checks when shared boundaries change.

## Cross-Cutting Boundaries

- Use the graph artifact for Context Point boundaries.

## Cross-Cutting Security Rules

- Do not expose secrets in generated artifacts.
- Treat environment and credential paths as sensitive.

## Generated Code Policy

- Regenerate context with `agentctx build`.

## High-Risk Global Areas

- Package scripts, CI workflows, generated artifacts, and shared contracts.

## Context Loading Guidance

- Read `.context/manifest.yaml` first.
- Load only the relevant Context Point for the task.

## Evidence

- Files scanned: 837
- Context Points discovered: 4

## Unknowns

- None.
