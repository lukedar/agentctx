# Task: Validate Compiler Surface Integration Across Core Packages

## Goal

Validate the compiler surface across core, adapters, targets, CLI, runner, and docs.

## Background

AgentCtx behaves like a deterministic compiler. A complex benchmark should show that config, fact extraction, target rendering, command execution, benchmark reporting, and docs all stay aligned.

## Required Changes

- Add a core contract test for Context Point selection.
- Add adapter evidence for package and framework facts.
- Add target rendering assertions for generated context surfaces.
- Add CLI coverage for build, sync, and check pathways.
- Add benchmark report assertions for token summary and coverage.
- Add docs coverage for benchmark methodology and reports.

## Expected Files

- packages/core/**
- packages/adapters/**
- packages/targets/**
- packages/cli/**
- packages/dual-agent-runner/**
- docs-agentctx/**

## Forbidden Files

- .env
- .npmrc
- package-lock.json
- **/*.pem
- **/*.key

## Required Commands

- pnpm run test
- pnpm run typecheck
- pnpm run build
- VITEPRESS_BASE=/agentctx/ pnpm -C docs-agentctx build

## Success Criteria

- All main Context Points are represented in the coverage report.
- JSON, Markdown, and HTML reports include token and runtime deltas.
- Public docs render without leaking local paths.
- Scope misses are lower for AgentCtx-context than no-context.
- Build, test, and typecheck pass.

## Context Points

- core
- adapters
- targets
- cli
- dual-agent-runner
- docs-agentctx

## Difficulty

complex

## Tags

compiler
integration
coverage
docs
bench
