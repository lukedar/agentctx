# Task: Redesign Context Block Selection with Capability Weighting

## Goal

Redesign Context Block selection to use capability weighting.

## Background

The compiler should prefer high-signal context for a task instead of treating every Context Block equally.

## Required Changes

- Add weighted capability scoring.
- Explain selected and skipped Context Blocks.
- Add regression tests for stable ordering.

## Expected Files

- packages/core/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/core test
- pnpm run typecheck

## Success Criteria

- Selection uses weighted capability scores.
- Output remains deterministic.
- Tests cover ties and missing capabilities.

## Context Points

- core

## Difficulty

large

## Tags

core
compiler
selection
