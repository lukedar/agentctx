# Task: Add Monorepo Adapter Composition

## Goal

Add monorepo-aware adapter composition across multiple package frameworks.

## Background

Enterprise repos often include several framework stacks in one workspace, and adapters need to compose evidence cleanly.

## Required Changes

- Detect framework evidence per package.
- Merge adapter facts without duplicates.
- Add tests for multiple packages and stable ordering.

## Expected Files

- packages/adapters/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/adapters test
- pnpm run typecheck

## Success Criteria

- Monorepo framework evidence is scoped per package.
- Duplicate facts are avoided.
- Tests cover stable ordering.

## Context Points

- adapters

## Difficulty

large

## Tags

adapters
monorepo
composition
