# Task: Add Public-safe Context Validation to Bench and CLI

## Goal

Add public-safe context validation so AgentCtx can verify that public outputs only contain facts classified as public.

## Background

AgentCtx generates internal operational context and public-safe surfaces such as `llms.txt` and public manifests.

Public outputs must not contain sensitive, internal, or secret operational facts.

Bench should be able to test this behavior and report security findings.

## Required Changes

- Add visibility validation for public-safe outputs.
- Add `agentctx check --public-safe`.
- Add Bench scorer for public-safe context violations.
- Add security findings to Bench JSON and HTML reports.
- Add test fixtures for public, internal, sensitive, and secret facts.
- Ensure `llms.txt` renders only public facts.
- Ensure public manifests report excluded fact counts.

## Expected Files

- packages/core/**
- packages/cli/**
- packages/targets/**
- packages/dual-agent-runner/**

## Forbidden Files

- .env
- .npmrc
- package-lock.json
- docs/generated/**
- examples/private/**
- **/*.pem
- **/*.key

## Required Commands

- pnpm run test
- pnpm run typecheck
- pnpm run build
- pnpm -C packages/cli test

## Success Criteria

- `agentctx check --public-safe` exists and passes for valid fixtures.
- Public outputs only contain public facts.
- Internal, sensitive, and secret facts are excluded from public outputs.
- Bench report includes public-safe validation findings.
- HTML report shows security findings clearly.
- Tests cover public, internal, sensitive, and secret classifications.
- No forbidden files are modified.
- No secret-like values are emitted.

## Context Points

- core
- cli
- targets
- dual-agent-runner

## Difficulty

complex

## Tags

security
public-safe
llms
bench
cli
visibility
cross-package
