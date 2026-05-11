# Task: Add Benchmark Lifecycle Reporting

## Goal

Add benchmark lifecycle reporting across JSON, Markdown, HTML, and coverage artifacts.

## Background

Very large benchmark runs need reproducible evidence for task parsing, condition execution, coverage, and publication.

## Required Changes

- Add lifecycle state to benchmark run metadata.
- Generate JSON, Markdown, HTML, and coverage artifacts.
- Add tests for completed and failed lifecycle states.
- Publish sanitized report indexes.

## Expected Files

- packages/dual-agent-runner/**

## Forbidden Files

- .env
- .npmrc
- package-lock.json

## Required Commands

- pnpm -C packages/dual-agent-runner test
- pnpm run typecheck
- pnpm run build

## Success Criteria

- Lifecycle state is visible in every report.
- Failed runs still produce diagnostics.
- Public report data is sanitized.

## Context Points

- dual-agent-runner

## Difficulty

very-large

## Tags

dual-agent-runner
lifecycle
reporting
