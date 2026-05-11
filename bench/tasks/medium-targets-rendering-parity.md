# Task: Add Target Rendering Parity Checks

## Goal

Add rendering parity checks across generated target surfaces.

## Background

AGENTS, CLAUDE, Cursor, Copilot, and llms targets should agree on shared safe context.

## Required Changes

- Add target parity test fixtures.
- Compare shared generated sections.
- Preserve target-specific formatting.

## Expected Files

- packages/targets/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/targets test
- pnpm run typecheck

## Success Criteria

- Shared context is consistent across targets.
- Target-specific formatting is preserved.
- Tests pass.

## Context Points

- targets

## Difficulty

medium

## Tags

targets
rendering
parity
