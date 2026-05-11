# Task: Add Suite Coverage Links

## Goal

Add suite-level Context Point coverage and per-task report links.

## Background

Senior reviewers need to move from aggregate report status to exact task and Context Point evidence.

## Required Changes

- Render Context Point coverage by suite.
- Link each task to its run report.
- Link each task to its coverage report.

## Expected Files

- packages/dual-agent-runner/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/dual-agent-runner test
- pnpm run typecheck

## Success Criteria

- Coverage links are generated.
- Report links are stable.
- Tests cover HTML output.

## Context Points

- dual-agent-runner

## Difficulty

large

## Tags

dual-agent-runner
coverage
html
