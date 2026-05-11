# Task: Add Cross-package Regression Benchmark

## Benchmark Repo

React

## Expected Effort

15+ days

## Goal

Add a cross-package regression benchmark for scheduler, reconciler, DOM, and test fixtures.

## Background

Complex React changes require reasoning across scheduling, reconciliation, DOM rendering, shared utilities, tests, and release infrastructure. This task validates whether operational context narrows that scope.

## Required Changes

- Add regression benchmark metadata.
- Map scheduler and reconciler interactions.
- Add DOM and fixture coverage.
- Add release-infra compatibility notes.

## Expected Files

- react/packages/scheduler/**
- react/packages/react-reconciler/**
- react/packages/react-dom/**
- react/packages/shared/**
- react/fixtures/**
- react/scripts/release/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- yarn test --filter react-reconciler
- yarn test --filter scheduler
- yarn lint

## Success Criteria

- Cross-package benchmark covers runtime and test surfaces.
- Required Context Points are selected.
- Irrelevant edits are minimized.

## Context Points

- scheduler
- react-reconciler
- react-dom
- shared
- fixtures
- release-infra

## Difficulty

large

## Tags

react
regression
cross-package
