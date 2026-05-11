# Task: Add Bench Command UX

## Goal

Add clear CLI help and dry-run output for benchmark execution.

## Background

Senior developers need predictable commands for validating benchmark task plans before running reports.

## Required Changes

- Add `benchmark run --suite` help coverage.
- Add parser-only dry-run output.
- Add CLI tests for missing arguments.

## Expected Files

- packages/cli/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/cli test
- pnpm run typecheck

## Success Criteria

- Help output documents benchmark usage.
- Dry-run output is deterministic.
- CLI tests pass.

## Context Points

- cli

## Difficulty

medium

## Tags

cli
bench
ux
