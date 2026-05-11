# Task: Add Explainable Build Sync Check Workflow Output

## Goal

Add explainable workflow output for build, sync, and check commands.

## Background

Agents need clear command output that shows what changed, what was skipped, and what should happen next.

## Required Changes

- Add workflow summaries to CLI commands.
- Keep JSON and human output equivalent.
- Add tests for stable command output.

## Expected Files

- packages/cli/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/cli test
- pnpm run typecheck

## Success Criteria

- Build, sync, and check explain their decisions.
- JSON output keeps machine-readable parity.
- Tests cover success and drift cases.

## Context Points

- cli

## Difficulty

large

## Tags

cli
workflow
json
