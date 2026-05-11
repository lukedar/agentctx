# Task: Add API-to-data Context Mesh Map

## Benchmark Repo

.NET

## Expected Effort

10+ days

## Goal

Add a Context Mesh map from API services to data contracts and database dependencies.

## Background

Backend service work usually needs API surface, contracts, and persistence context. AgentCtx should load those domains without pulling unrelated infra.

## Required Changes

- Map API services to data contracts.
- Add database dependency annotations.
- Add validation for service-to-contract links.

## Expected Files

- backend-infra/api-services/**
- backend-infra/contracts/**
- backend-infra/database/**

## Forbidden Files

- .env
- appsettings.Production.json
- **/*.pem
- **/*.key

## Required Commands

- dotnet test
- dotnet build

## Success Criteria

- API-to-data mesh is deterministic.
- Contracts and database dependencies are linked.
- Infra and security files are not modified.

## Context Points

- api-services
- contracts
- database

## Difficulty

medium

## Tags

backend
contracts
database
