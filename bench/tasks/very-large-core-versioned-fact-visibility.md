# Task: Introduce Versioned Fact Visibility and Graph Contracts

## Goal

Introduce migration-safe fact visibility and versioned graph contracts.

## Background

AgentCtx needs stable public and internal context contracts as facts evolve across adapters and targets.

## Required Changes

- Add versioned fact visibility metadata.
- Add migration tests for graph contract changes.
- Validate public-safe exclusions from graph data.
- Document compatibility expectations in core tests.

## Expected Files

- packages/core/**

## Forbidden Files

- .env
- .npmrc
- package-lock.json
- **/*.pem
- **/*.key

## Required Commands

- pnpm -C packages/core test
- pnpm run typecheck
- pnpm run build

## Success Criteria

- Graph contracts are versioned.
- Public/internal visibility remains explicit.
- Migration tests protect existing facts.

## Context Points

- core

## Difficulty

very-large

## Tags

core
visibility
graph
compatibility
