# Task: Add Multi-step Repo Workflow Orchestration

## Goal

Add deterministic CLI orchestration for multi-step repo workflows.

## Background

Large agent tasks need repeatable command plans that can build context, sync targets, check drift, run benchmarks, and report status.

## Required Changes

- Add a workflow command plan contract.
- Add deterministic step reports.
- Add failure handling for partial command completion.
- Add tests for JSON output and exit codes.

## Expected Files

- packages/cli/**

## Forbidden Files

- .env
- .npmrc
- package-lock.json

## Required Commands

- pnpm -C packages/cli test
- pnpm run typecheck
- pnpm run build

## Success Criteria

- Multi-step workflows are reproducible.
- Failures preserve actionable reports.
- Exit codes match command status.

## Context Points

- cli

## Difficulty

very-large

## Tags

cli
orchestration
workflow
