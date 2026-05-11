# Task: Add Generated Report Examples

## Goal

Add generated report examples and Context Point coverage interpretation.

## Background

Readers should understand how to read suite totals, per-task tables, and Context Point coverage.

## Required Changes

- Add report interpretation examples.
- Explain aggregate token and runtime deltas.
- Explain Context Point coverage rows.

## Expected Files

- docs-agentctx/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- VITEPRESS_BASE=/agentctx/ pnpm -C docs-agentctx build
- pnpm run typecheck

## Success Criteria

- Examples match generated report output.
- Coverage interpretation is clear.
- Docs build passes.

## Context Points

- docs-agentctx

## Difficulty

large

## Tags

docs
examples
coverage
