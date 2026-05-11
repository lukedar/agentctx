# Task: Add Context Point Coverage to Bench Reports

## Goal

Add Context Point coverage reporting to Bench.

## Background

AgentCtx uses Context Points to describe bounded operational domains. Bench should show which Context Points were touched by a task and whether they were covered by tests.

## Required Changes

- Detect changed files by Context Point.
- Map test files to Context Points.
- Add `coverageByContextPoint` to the JSON report.
- Add Context Point coverage section to Markdown report.
- Add Context Point coverage section to HTML report.
- Add tests for covered, partial, and missing coverage states.

## Expected Files

- packages/dual-agent-runner/**
- packages/core/**

## Forbidden Files

- .env
- package-lock.json
- docs/generated/**
- examples/**

## Required Commands

- pnpm -C packages/dual-agent-runner test
- pnpm -C packages/core test
- pnpm run typecheck

## Success Criteria

- JSON report includes `coverageByContextPoint`.
- Markdown report includes Context Point coverage.
- HTML report includes Context Point coverage.
- Covered, partial, and missing states are tested.
- No forbidden files are modified.
- Irrelevant package edits are minimized.

## Context Points

- dual-agent-runner
- core

## Difficulty

medium

## Tags

bench
context-points
coverage
reporting
cross-package
