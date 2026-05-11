# Task: Add Target Compatibility Migration Tests

## Goal

Add target compatibility migration tests for generated-block preservation.

## Background

Target output changes must preserve manual edits outside generated blocks and remain compatible with existing files.

## Required Changes

- Add compatibility fixtures for existing target files.
- Preserve manual content outside generated blocks.
- Add migration tests for all target surfaces.
- Validate deterministic diff output.

## Expected Files

- packages/targets/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- pnpm -C packages/targets test
- pnpm run typecheck
- pnpm run build

## Success Criteria

- Manual edits survive target regeneration.
- Migration tests cover all supported targets.
- Diffs remain stable.

## Context Points

- targets

## Difficulty

very-large

## Tags

targets
compatibility
migration
