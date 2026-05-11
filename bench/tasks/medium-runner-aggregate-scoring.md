# Task: Add Aggregate Benchmark Scoring

## Goal

Add aggregate token and runtime scoring to benchmark reports.

## Background

Bench reports should show suite-level performance, not only per-task deltas.

## Required Changes

- Aggregate condition token usage.
- Aggregate condition runtime.
- Add tests for percentage deltas.

## Expected Files

- packages/dual-agent-runner/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/dual-agent-runner test
- pnpm run typecheck

## Success Criteria

- Suite reports include aggregate deltas.
- Percentages are stable.
- Tests pass.

## Context Points

- dual-agent-runner

## Difficulty

medium

## Tags

dual-agent-runner
scoring
tokens
