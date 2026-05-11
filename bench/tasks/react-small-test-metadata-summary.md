# Task: Add React Test Metadata Summary

## Benchmark Repo

React

## Expected Effort

5+ days

## Goal

Add a test metadata summary for React test fixtures.

## Background

React test fixtures span renderer behavior and shared utilities. This focused task should need one operational domain and prove that AgentCtx avoids loading unrelated package context.

## Required Changes

- Extract metadata from React test fixture files.
- Summarize test categories and affected package area.
- Add validation for stable metadata ordering.

## Expected Files

- react/tests/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- yarn test --filter react-tests

## Success Criteria

- Metadata summary is deterministic.
- Only test Context Point files are modified.
- No unrelated renderer packages are changed.

## Context Points

- tests

## Difficulty

small

## Tags

react
tests
metadata
