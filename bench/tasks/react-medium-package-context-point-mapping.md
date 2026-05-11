# Task: Add Package Context Point Mapping

## Benchmark Repo

React

## Expected Effort

10+ days

## Goal

Add package-to-Context Point mapping for React packages.

## Background

React package work often crosses core runtime, DOM rendering, and shared utilities. AgentCtx should select the package domains needed for the task without loading the full repository.

## Required Changes

- Map package directories to Context Points.
- Add package ownership metadata.
- Add validation for package-to-context resolution.

## Expected Files

- react/packages/react/**
- react/packages/react-dom/**
- react/packages/shared/**

## Forbidden Files

- .env
- package-lock.json

## Required Commands

- yarn test --filter react-dom
- yarn lint

## Success Criteria

- Package mapping covers React core, DOM, and shared code.
- Context Point mapping is stable.
- No release infrastructure files are modified.

## Context Points

- react-core
- react-dom
- shared

## Difficulty

medium

## Tags

react
context-points
packages
