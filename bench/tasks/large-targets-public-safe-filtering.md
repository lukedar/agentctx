# Task: Add Public-safe Filtering Across Targets

## Goal

Add public-safe visibility filtering across every target renderer.

## Background

Public targets must exclude internal, sensitive, and secret operational facts.

## Required Changes

- Apply public-safe filtering to supported targets.
- Add exclusion count reporting.
- Add tests for internal and sensitive facts.

## Expected Files

- packages/targets/**

## Forbidden Files

- .env
- .npmrc
- package-lock.json
- **/*.pem
- **/*.key

## Required Commands

- pnpm -C packages/targets test
- pnpm run typecheck

## Success Criteria

- Public outputs exclude unsafe facts.
- Exclusion counts are deterministic.
- Tests cover every target renderer.

## Context Points

- targets

## Difficulty

large

## Tags

targets
public-safe
security
