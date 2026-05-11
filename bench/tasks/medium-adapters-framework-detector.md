# Task: Add Framework Detector Fixture

## Goal

Add a framework detector fixture and fact extractor.

## Background

Adapter coverage should prove that new framework evidence can be detected without broad source dumps.

## Required Changes

- Add a detector fixture.
- Emit a compact framework fact.
- Add tests for confidence and source path.

## Expected Files

- packages/adapters/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/adapters test
- pnpm run typecheck

## Success Criteria

- Detector emits deterministic facts.
- Confidence is conservative.
- Tests pass.

## Context Points

- adapters

## Difficulty

medium

## Tags

adapters
framework
facts
