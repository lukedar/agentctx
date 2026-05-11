# Task: Add Token Summary to Bench JSON Report

## Goal

Add a `tokenSummary` object to the Bench JSON report.

## Background

Bench captures token usage for each condition, but reports need a compact summary field so docs and HTML reports can show token deltas clearly.

## Required Changes

- Add `tokenSummary` to the JSON report output.
- Include total tokens per condition.
- Include token delta between `no-context` and `agentctx-context`.
- Add unit tests for token summary generation.

## Expected Files

- packages/dual-agent-runner/**

## Forbidden Files

- .env
- package-lock.json
- docs/generated/**

## Required Commands

- pnpm -C packages/dual-agent-runner test
- pnpm run typecheck

## Success Criteria

- JSON report includes `tokenSummary`.
- Unit tests pass.
- Typecheck passes.
- No forbidden files are modified.
- No unrelated packages are changed.

## Context Points

- dual-agent-runner

## Difficulty

small

## Tags

bench
tokens
reporting
