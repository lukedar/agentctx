# Task: Add Service Command Summary

## Benchmark Repo

.NET

## Expected Effort

5+ days

## Goal

Add a service command summary for backend app-host operations.

## Background

Backend operational tasks often start with service commands and runtime entrypoints. This small task should stay within the app host domain.

## Required Changes

- Summarize app-host service commands.
- Document runtime command ownership.
- Add a validation check for command discovery.

## Expected Files

- backend-infra/app-host/**

## Forbidden Files

- .env
- appsettings.Production.json
- package-lock.json

## Required Commands

- dotnet test

## Success Criteria

- Service commands are summarized.
- Runtime entrypoints are mapped.
- No data or infra files are modified.

## Context Points

- app-host

## Difficulty

small

## Tags

backend
services
commands
