# Task: Add Typed Context Point Capability Metadata

## Goal

Add typed capability metadata to Context Point selection.

## Background

Context Points should explain what evidence they contain and what tasks they support.

## Required Changes

- Add capability metadata to core Context Point models.
- Preserve deterministic sorting.
- Add tests for capability selection.

## Expected Files

- packages/core/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/core test
- pnpm run typecheck

## Success Criteria

- Capability metadata is typed.
- Selection remains deterministic.
- Core tests pass.

## Context Points

- core

## Difficulty

medium

## Tags

core
context-architecture
metadata
