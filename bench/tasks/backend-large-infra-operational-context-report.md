# Task: Add Infrastructure-aware Operational Context Report

## Benchmark Repo

.NET

## Expected Effort

15+ days

## Goal

Add an infrastructure-aware operational context report for backend services.

## Background

Large backend tasks require service boundaries, worker behavior, database dependencies, infrastructure runtime, observability, security, and tests. AgentCtx should show which domains are required and which are excluded.

## Required Changes

- Add service boundary reporting.
- Map worker and database dependencies.
- Include infra and observability context.
- Include security constraints without exposing secrets.
- Add test coverage mapping.

## Expected Files

- backend-infra/api-services/**
- backend-infra/workers/**
- backend-infra/database/**
- backend-infra/infra/**
- backend-infra/observability/**
- backend-infra/security/**
- backend-infra/tests/**

## Forbidden Files

- .env
- appsettings.Production.json
- **/*.pem
- **/*.key

## Required Commands

- dotnet test
- dotnet build

## Success Criteria

- Operational report covers service, worker, data, infra, observability, security, and tests.
- Secrets are not emitted.
- Irrelevant edits are lower with AgentCtx context.

## Context Points

- api-services
- workers
- database
- infra
- observability
- security
- tests

## Difficulty

large

## Tags

backend
infra
observability
security
