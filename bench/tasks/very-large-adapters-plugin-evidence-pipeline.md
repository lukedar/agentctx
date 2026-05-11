# Task: Add Plugin Evidence Pipeline

## Goal

Add a plugin extension pipeline for adapter detection, confidence, and evidence reuse.

## Background

Framework extensions should be added as plugins that reuse scan context and emit structured facts.

## Required Changes

- Add plugin lifecycle hooks for detect and extract.
- Reuse cached scan context reads.
- Add confidence aggregation.
- Add fixture tests for multiple plugins.

## Expected Files

- packages/adapters/**

## Forbidden Files

- .env
- .npmrc
- package-lock.json

## Required Commands

- pnpm -C packages/adapters test
- pnpm run typecheck
- pnpm run build

## Success Criteria

- Plugins can add framework evidence safely.
- Detection work is reused during extraction.
- Confidence aggregation is deterministic.

## Context Points

- adapters

## Difficulty

very-large

## Tags

adapters
plugins
framework-extensions
