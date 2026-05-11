# Task: Add Adapter and Target Smoke Coverage

## Goal

Add a small smoke benchmark that proves adapter facts flow into target rendering without broad source scanning.

## Background

Adapters extract repo evidence and targets render agent-facing context. A small benchmark should verify that a change crossing those two Context Points remains tightly scoped.

## Required Changes

- Add an adapter fixture that emits one framework fact.
- Add a target assertion that renders the fact into an agent surface.
- Add a focused test for adapter-to-target flow.

## Expected Files

- packages/adapters/**
- packages/targets/**

## Forbidden Files

- .env
- package-lock.json
- docs/generated/**

## Required Commands

- pnpm -C packages/adapters test
- pnpm -C packages/targets test
- pnpm run typecheck

## Success Criteria

- Adapter fixture emits a deterministic fact.
- Target renderer includes the expected fact.
- Tests pass for both touched Context Points.
- No unrelated package files are modified.

## Context Points

- adapters
- targets

## Difficulty

small

## Tags

adapter
targets
coverage
smoke
