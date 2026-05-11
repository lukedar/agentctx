# Task: Add CLI and Docs Benchmark Command Coverage

## Goal

Add benchmark command documentation and CLI coverage for running the mock benchmark suite.

## Background

The benchmark runner is exposed through package scripts and the dual-agent-runner CLI. Docs should show the command surface while CLI tests keep the command parser stable.

## Required Changes

- Add CLI coverage for `benchmark run --suite`.
- Add docs coverage for the benchmark reports page.
- Verify generated public benchmark JSON is safe to publish.
- Add a test that parser-only dry runs list every suite task.

## Expected Files

- packages/dual-agent-runner/**
- docs-agentctx/**
- package.json

## Forbidden Files

- .env
- package-lock.json
- examples/private/**

## Required Commands

- pnpm -C packages/dual-agent-runner test
- VITEPRESS_BASE=/agentctx/ pnpm -C docs-agentctx build
- pnpm run typecheck

## Success Criteria

- CLI dry-run output includes all suite tasks.
- Docs build with the benchmark reports page.
- Public benchmark JSON has no local absolute paths.
- Context Point coverage includes runner and docs surfaces.

## Context Points

- dual-agent-runner
- docs-agentctx

## Difficulty

medium

## Tags

cli
docs
bench
reporting
