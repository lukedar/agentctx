# Task: Add Benchmark Methodology Docs

## Goal

Add benchmark methodology docs for senior engineers.

## Background

Benchmark claims need methodology, assumptions, and limitations beside the report data.

## Required Changes

- Document no-context versus AgentCtx-context methodology.
- Document mock evidence limitations.
- Add docs build coverage.

## Expected Files

- docs-agentctx/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- VITEPRESS_BASE=/agentctx/ pnpm -C docs-agentctx build
- pnpm run typecheck

## Success Criteria

- Methodology is clear.
- Limitations are explicit.
- Docs build passes.

## Context Points

- docs-agentctx

## Difficulty

medium

## Tags

docs
bench
methodology
