# AgentCtx Implementation Plan: Framework-Agnostic and Framework-Specific Context Files

## Purpose

Add a structured Markdown context-file system to AgentCtx.

The goal is to generate the most useful `.md` files for agents by separating:

```text
AGENTS.md = entrypoint and routing
core/*.md = framework-agnostic operational context
framework/*.md = framework-specific operational context
```

This makes AgentCtx more useful for polyglot monorepos, multi-framework applications, and professional engineering teams that need precise, low-noise, secure, and token-efficient agent context.

---

## Core Principle

AgentCtx must not dump all knowledge into one file.

Instead, it should generate small, focused context files that an agent can load based on the task.

The default model:

```text
context point/
  AGENTS.md

  .agentctx/context/
    overview.md
    architecture.md
    conventions.md
    commands.md
    dependencies.md
    testing.md
    security.md
    boundaries.md

    routes.md        # if frontend/router detected
    api.md           # if API detected
    database.md      # if database detected
    auth.md          # if auth detected
    state.md         # if frontend state detected
    schemas.md       # if shared contracts detected
    queues.md        # if worker/queue detected
    deployments.md   # if deployable service detected
```

The generated context should be:

- deterministic
- diff-friendly
- token-aware
- safe by default
- framework-aware
- useful to agents
- understandable by senior engineers

---

## Required Universal Files

Every context point should generate these files by default.

```text
.agentctx/context/
  overview.md
  architecture.md
  conventions.md
  commands.md
  dependencies.md
  testing.md
  security.md
  boundaries.md
```

---

## Universal File Responsibilities

### `overview.md`

Purpose:

- Explain what the context point is.
- Explain what it owns.
- Explain what it does not own.
- Summarise its role in the wider system.

Required sections:

```md
# Overview

## Purpose

## Responsibilities

## Non-Responsibilities

## Primary Technologies

## Related Context Points
```

Agent value:

- Fast orientation.
- Reduces hallucinated ownership.
- Helps the agent decide whether this context point is relevant.

---

### `architecture.md`

Purpose:

- Explain internal structure.
- Explain layers/modules.
- Explain key flows.
- Explain important design decisions.

Required sections:

```md
# Architecture

## High-Level Structure

## Main Modules

## Data Flow

## Key Design Decisions

## Known Constraints
```

Agent value:

- Helps agents make changes in the right layer.
- Prevents architectural drift.
- Improves code placement decisions.

---

### `conventions.md`

Purpose:

- Capture local coding rules.
- Capture naming patterns.
- Capture folder conventions.
- Capture error/logging patterns.

Required sections:

```md
# Conventions

## Naming

## Folder Structure

## Code Style

## Error Handling

## Logging

## Anti-Patterns
```

Agent value:

- Reduces inconsistent code.
- Makes generated code fit the repo style.

---

### `commands.md`

Purpose:

- Provide safe commands for this context point.

Required sections:

```md
# Commands

## Install

## Development

## Build

## Test

## Lint

## Typecheck

## Safe Targeted Commands

## Commands To Avoid
```

Agent value:

- Prevents unsafe or overly broad command execution.
- Encourages targeted testing.

Security note:

- Never include commands that delete data, reset databases, rotate secrets, or deploy production unless explicitly configured as safe.

---

### `dependencies.md`

Purpose:

- Explain key internal and external dependencies.

Required sections:

```md
# Dependencies

## Internal Dependencies

## External Dependencies

## Runtime Dependencies

## Development Dependencies

## Dependency Boundaries

## Risky Dependencies
```

Agent value:

- Helps agents understand what is safe to modify.
- Helps with dependency-aware builds.
- Supports context mesh generation.

---

### `testing.md`

Purpose:

- Explain how tests work for the context point.

Required sections:

```md
# Testing

## Test Frameworks

## Test Locations

## Test Naming

## How To Run Targeted Tests

## Mocking Rules

## Coverage Expectations

## Common Test Failures
```

Agent value:

- Helps agents validate changes.
- Prevents running full monorepo test suites unnecessarily.

---

### `security.md`

Purpose:

- Capture security rules and sensitive areas.

Required sections:

```md
# Security

## Authentication

## Authorization

## Secret Handling

## Sensitive Files

## Input Validation

## Data Exposure Risks

## Security Anti-Patterns
```

Agent value:

- Prevents unsafe code changes.
- Helps security-aware agents review changes.
- Improves confidence for enterprise adoption.

Strict requirement:

- Never output secret values.
- Only output secret variable names.
- Redact sensitive values.

---

### `boundaries.md`

Purpose:

- Define what this context point can and cannot change.

Required sections:

```md
# Boundaries

## Owns

## Does Not Own

## Allowed Changes

## Restricted Changes

## Cross-Context Dependencies

## When To Load Related Context
```

Agent value:

- Critical for monorepos.
- Prevents agents from editing unrelated systems.
- Makes task scoping clearer.

---

## Root Workspace Files

At the root of a repository, generate workspace-level context files.

```text
.agentctx/context/
  workspace.md
  mesh.md
  ownership.md
  global-commands.md
  release.md
```

---

## Root File Responsibilities

### `workspace.md`

Purpose:

- Explain the full repository.

Sections:

```md
# Workspace

## Repository Purpose

## Repository Structure

## Context Points

## Primary Workflows

## Global Constraints
```

---

### `mesh.md`

Purpose:

- Explain how context points connect.

Sections:

```md
# Context Mesh

## System Graph

## Dependency Direction

## Runtime Communication

## Shared Contracts

## Cross-System Change Rules
```

Example content:

```text
frontend -> api -> database
worker -> queue -> api
shared-contracts -> frontend, api, worker
```

---

### `ownership.md`

Purpose:

- Explain ownership boundaries.

Sections:

```md
# Ownership

## Teams

## Owned Context Points

## Shared Areas

## Review Requirements
```

---

### `global-commands.md`

Purpose:

- Explain root-level commands.

Sections:

```md
# Global Commands

## Install

## Build

## Test

## Lint

## Typecheck

## CI

## Commands To Avoid
```

---

### `release.md`

Purpose:

- Explain deployment/release behavior.

Sections:

```md
# Release

## Release Flow

## Environments

## Versioning

## Deployment Gates

## Rollback Notes
```

---

## Framework-Specific Context Files

AgentCtx should generate framework-specific files only when the relevant capability is detected.

Do not generate empty files.

Do not generate speculative files.

If detection confidence is low, emit a warning and skip the file unless the user explicitly configures it.

---

## Frontend Context Files

Applicable to:

- React
- Angular
- Vue
- Svelte
- Solid
- Next.js
- Nuxt
- Astro
- Remix

Recommended files:

```text
routes.md
components.md
state.md
styling.md
accessibility.md
forms.md
api-client.md
```

### Highest-value frontend files

```text
routes.md
state.md
api-client.md
components.md
```

### `routes.md`

Sections:

```md
# Routes

## Routing System

## Public Routes

## Protected Routes

## Layouts

## Route Guards

## Dynamic Routes

## Navigation Rules
```

### `components.md`

Sections:

```md
# Components

## Component Structure

## Shared Components

## Page Components

## Composition Patterns

## Props and Events

## Anti-Patterns
```

### `state.md`

Sections:

```md
# State Management

## State Libraries

## Local State

## Server State

## Global State

## Caching

## State Anti-Patterns
```

### `styling.md`

Sections:

```md
# Styling

## Styling System

## Design Tokens

## Component Styling

## Responsive Rules

## Theming

## Styling Anti-Patterns
```

### `accessibility.md`

Sections:

```md
# Accessibility

## Required Standards

## Keyboard Navigation

## Forms

## ARIA Usage

## Common Issues
```

### `forms.md`

Sections:

```md
# Forms

## Form Libraries

## Validation

## Error Display

## Submission Flow

## Security Notes
```

### `api-client.md`

Sections:

```md
# API Client

## Client Library

## Request Patterns

## Error Handling

## Auth Headers

## Generated Clients

## Contract Source
```

---

## Backend API Context Files

Applicable to:

- Node.js APIs
- .NET APIs
- Java APIs
- Go APIs
- Python APIs
- Ruby APIs
- PHP APIs

Recommended files:

```text
api.md
auth.md
database.md
middleware.md
validation.md
errors.md
observability.md
```

### Highest-value backend files

```text
api.md
auth.md
database.md
validation.md
errors.md
```

### `api.md`

Sections:

```md
# API

## API Style

## Route Structure

## Controllers or Handlers

## Request Flow

## Response Shape

## Public Endpoints

## Internal Endpoints
```

### `auth.md`

Sections:

```md
# Auth

## Authentication Method

## Authorization Model

## Roles and Permissions

## Token Handling

## Session Handling

## Auth Anti-Patterns
```

### `database.md`

Sections:

```md
# Database

## Database Technology

## ORM or Query Layer

## Schema Location

## Migration Flow

## Transaction Rules

## Query Anti-Patterns
```

### `middleware.md`

Sections:

```md
# Middleware

## Request Pipeline

## Global Middleware

## Route Middleware

## Error Middleware

## Security Middleware
```

### `validation.md`

Sections:

```md
# Validation

## Input Validation

## Schema Libraries

## DTOs

## Request Validation

## Response Validation

## Validation Anti-Patterns
```

### `errors.md`

Sections:

```md
# Errors

## Error Model

## Error Types

## HTTP Mapping

## Logging

## User-Facing Errors

## Internal Errors
```

### `observability.md`

Sections:

```md
# Observability

## Logging

## Metrics

## Tracing

## Health Checks

## Alerting

## Debugging Notes
```

---

## Worker and Queue Context Files

Applicable to:

- background workers
- queue consumers
- cron services
- scheduled jobs
- event processors

Recommended files:

```text
jobs.md
queues.md
scheduling.md
retries.md
idempotency.md
observability.md
```

### Highest-value worker files

```text
jobs.md
queues.md
retries.md
idempotency.md
```

### `jobs.md`

Sections:

```md
# Jobs

## Job Types

## Job Entry Points

## Job Payloads

## Job Lifecycle

## Failure Handling
```

### `queues.md`

Sections:

```md
# Queues

## Queue Technology

## Queue Names

## Producers

## Consumers

## Message Contracts

## Dead Letter Handling
```

### `scheduling.md`

Sections:

```md
# Scheduling

## Scheduler

## Scheduled Tasks

## Frequency

## Timezone Rules

## Operational Risks
```

### `retries.md`

Sections:

```md
# Retries

## Retry Strategy

## Backoff

## Max Attempts

## Poison Messages

## Manual Recovery
```

### `idempotency.md`

Sections:

```md
# Idempotency

## Idempotency Keys

## Duplicate Handling

## Side Effects

## Safe Retry Rules
```

---

## Shared Package and Library Context Files

Applicable to:

- shared packages
- SDKs
- design systems
- internal libraries
- contracts packages

Recommended files:

```text
exports.md
schemas.md
versioning.md
compatibility.md
public-api.md
usage.md
```

### Highest-value shared package files

```text
exports.md
public-api.md
compatibility.md
schemas.md
```

### `exports.md`

Sections:

```md
# Exports

## Public Exports

## Private Internals

## Entry Points

## Import Rules

## Breaking Change Risks
```

### `schemas.md`

Sections:

```md
# Schemas

## Schema Types

## Source of Truth

## Generated Types

## Consumers

## Compatibility Rules
```

### `versioning.md`

Sections:

```md
# Versioning

## Version Strategy

## Release Rules

## Breaking Changes

## Deprecations
```

### `compatibility.md`

Sections:

```md
# Compatibility

## Supported Consumers

## Backward Compatibility

## Forward Compatibility

## Migration Notes
```

### `public-api.md`

Sections:

```md
# Public API

## Stable APIs

## Experimental APIs

## Deprecated APIs

## Usage Examples

## Do Not Use
```

### `usage.md`

Sections:

```md
# Usage

## Common Usage

## Recommended Patterns

## Anti-Patterns

## Examples
```

---

## Database and Data Layer Context Files

Applicable to:

- ORM packages
- database projects
- migration projects
- data access layers

Recommended files:

```text
schema.md
migrations.md
queries.md
seed-data.md
data-access.md
```

### Highest-value data files

```text
schema.md
migrations.md
data-access.md
```

### `schema.md`

Sections:

```md
# Schema

## Entities

## Relationships

## Constraints

## Indexes

## Sensitive Tables
```

### `migrations.md`

Sections:

```md
# Migrations

## Migration Tool

## Migration Location

## Migration Rules

## Rollback Rules

## Production Safety
```

### `queries.md`

Sections:

```md
# Queries

## Query Patterns

## Performance Rules

## N+1 Risks

## Raw SQL Rules
```

### `seed-data.md`

Sections:

```md
# Seed Data

## Seed Scripts

## Test Data

## Local Data

## Unsafe Data
```

### `data-access.md`

Sections:

```md
# Data Access

## Access Layer

## Repository Patterns

## Transactions

## Caching

## Anti-Patterns
```

---

## Infrastructure Context Files

Applicable to:

- deployment projects
- IaC projects
- Docker/Kubernetes folders
- GitHub Actions
- Terraform/Pulumi/CDK
- cloud infrastructure

Recommended files:

```text
deployments.md
environments.md
secrets.md
observability.md
ci-cd.md
permissions.md
```

### Highest-value infra files

```text
environments.md
ci-cd.md
secrets.md
permissions.md
```

### `deployments.md`

Sections:

```md
# Deployments

## Deployment Targets

## Deployment Flow

## Artifacts

## Rollback

## Release Gates
```

### `environments.md`

Sections:

```md
# Environments

## Local

## Development

## Staging

## Production

## Environment Differences
```

### `secrets.md`

Sections:

```md
# Secrets

## Secret Names

## Storage

## Access Rules

## Rotation Notes

## Redaction Rules
```

Strict rule:

- Include secret names only.
- Never include secret values.

### `ci-cd.md`

Sections:

```md
# CI/CD

## Pipelines

## Jobs

## Required Checks

## Deployment Gates

## Failure Recovery
```

### `permissions.md`

Sections:

```md
# Permissions

## Service Accounts

## Roles

## Access Boundaries

## Least Privilege Notes
```

---

## Context File Selection Algorithm

AgentCtx should select files based on detected capabilities.

Example capability model:

```ts
export type Capability =
  | "frontend"
  | "routing"
  | "components"
  | "state"
  | "api"
  | "auth"
  | "database"
  | "worker"
  | "queue"
  | "shared-package"
  | "schemas"
  | "infrastructure"
  | "deployment"
  | "ci"
```

Context file registry:

```ts
export type ContextFileDefinition = {
  readonly name: string
  readonly category: "core" | "root" | "frontend" | "backend" | "worker" | "package" | "data" | "infra"
  readonly requiredCapabilities: readonly Capability[]
  readonly maxTokens: number
  readonly priority: number
  readonly publicSafe: boolean
}
```

Example registry:

```ts
export const contextFileRegistry: readonly ContextFileDefinition[] = [
  {
    name: "overview",
    category: "core",
    requiredCapabilities: [],
    maxTokens: 800,
    priority: 100,
    publicSafe: true
  },
  {
    name: "security",
    category: "core",
    requiredCapabilities: [],
    maxTokens: 1200,
    priority: 95,
    publicSafe: false
  },
  {
    name: "routes",
    category: "frontend",
    requiredCapabilities: ["frontend", "routing"],
    maxTokens: 1600,
    priority: 80,
    publicSafe: true
  },
  {
    name: "api",
    category: "backend",
    requiredCapabilities: ["api"],
    maxTokens: 1800,
    priority: 85,
    publicSafe: true
  },
  {
    name: "secrets",
    category: "infra",
    requiredCapabilities: ["infrastructure"],
    maxTokens: 1000,
    priority: 90,
    publicSafe: false
  }
]
```

Selection function:

```ts
export const selectContextFiles = (
  capabilities: readonly Capability[],
  registry: readonly ContextFileDefinition[]
): readonly ContextFileDefinition[] =>
  registry.filter((definition) =>
    definition.requiredCapabilities.every((capability) =>
      capabilities.includes(capability)
    )
  )
```

---

## Config Support

Allow users to override generated files.

```ts
export default defineConfig({
  contextPoints: [
    {
      name: "frontend",
      path: "apps/web",
      framework: "angular",
      contextFiles: {
        include: ["routes", "state", "api-client"],
        exclude: ["forms"],
        required: ["security", "boundaries"]
      }
    },
    {
      name: "api",
      path: "services/api",
      framework: "dotnet",
      contextFiles: {
        include: ["api", "auth", "database", "validation"],
        exclude: ["observability"]
      }
    }
  ]
})
```

Rules:

1. `required` files are always generated.
2. `exclude` removes optional files only.
3. Core safety files like `security.md` and `boundaries.md` cannot be excluded unless `allowUnsafeContextConfig: true`.
4. Missing capability files should not be generated unless explicitly included.

---

## AGENTS.md Load Order

Each context-point `AGENTS.md` should include a generated load order.

Example:

```md
## Recommended Load Order

1. `.agentctx/context/overview.md`
2. `.agentctx/context/boundaries.md`
3. `.agentctx/context/security.md`
4. `.agentctx/context/architecture.md`
5. `.agentctx/context/commands.md`

For frontend routing tasks, also load:

- `.agentctx/context/routes.md`
- `.agentctx/context/api-client.md`

For test changes, also load:

- `.agentctx/context/testing.md`
```

This lets an agent avoid loading everything.

---

## Token Budget Rules

Default budgets:

```text
overview.md: 800 tokens
architecture.md: 1600 tokens
conventions.md: 1200 tokens
commands.md: 900 tokens
dependencies.md: 1200 tokens
testing.md: 1300 tokens
security.md: 1200 tokens
boundaries.md: 1000 tokens

routes.md: 1600 tokens
api.md: 1800 tokens
database.md: 1800 tokens
auth.md: 1400 tokens
state.md: 1400 tokens
schemas.md: 1600 tokens
queues.md: 1400 tokens
deployments.md: 1200 tokens
```

Hard rule:

- `AGENTS.md` must stay compact.
- It should not duplicate the deeper context files.
- It should point to the right context files.

---

## Build and Drift Behavior

Each context file should have its own hash and freshness state.

Cache shape:

```json
{
  "contextPoints": {
    "frontend": {
      "files": {
        "overview.md": {
          "hash": "abc",
          "inputs": ["package.json", "src/app/**"],
          "estimatedTokens": 720
        },
        "routes.md": {
          "hash": "def",
          "inputs": ["src/app/routes/**"],
          "estimatedTokens": 1100
        }
      }
    }
  }
}
```

Changed route files should rebuild `routes.md`, not every file.

Changed auth middleware should rebuild:

```text
security.md
auth.md
api.md
```

Changed package dependencies should rebuild:

```text
dependencies.md
commands.md if scripts changed
```

---

## CLI Updates

### Inspect generated file plan

```bash
agentctx plan
agentctx plan --point frontend
```

Example output:

```text
Context files for frontend

Core:
✔ overview.md
✔ architecture.md
✔ conventions.md
✔ commands.md
✔ dependencies.md
✔ testing.md
✔ security.md
✔ boundaries.md

Detected:
✔ routes.md       routing detected
✔ state.md        NgRx detected
✔ api-client.md   generated OpenAPI client detected

Skipped:
- forms.md        no form library detected
- accessibility.md optional, not configured
```

### Build selected category

```bash
agentctx build --point frontend --category frontend
agentctx build --point api --category backend
agentctx build --point api --file auth
```

### Explain why a file exists

```bash
agentctx explain --point frontend --file routes
```

Example:

```text
routes.md is generated because Angular routing was detected in:
- apps/web/src/app/app.routes.ts
- apps/web/src/app/features/**/*
```

---

## Security Requirements

Generated files must not leak secrets.

Rules:

1. Never print secret values.
2. Never include `.env` values.
3. Do not expose private infra details in public outputs.
4. Mark files as `publicSafe: false` where needed.
5. `llms.txt` must only use public-safe files.
6. `security.md`, `secrets.md`, and `permissions.md` are local/internal only by default.

---

## Dual-Agent Review Requirements

This addition must be implemented through the dual-agent runner.

Agent 1 builds.

Agent 2 scores:

```text
performance
usability
code readability
security
token usage
correctness
distribution readiness
```

Agent 2 must specifically check:

- Are the files useful to agents?
- Are there too many files?
- Are files generated only when relevant?
- Are core files always present?
- Is sensitive information excluded?
- Is `AGENTS.md` compact?
- Is the load order clear?
- Can incremental builds update only affected files?
- Is the CLI easy to understand?

Release gate:

```text
overall score >= 8.5 / 10
security >= 9.0 / 10
token usage >= 8.5 / 10
usability >= 8.5 / 10
```

---

## Test Plan

### Unit tests

Test:

- context file registry
- capability detection
- file selection
- config include/exclude behavior
- token budget validation
- public-safe filtering
- security redaction
- load-order generation

### Integration tests

Use fixture:

```text
fixtures/polyglot-context-files/
  apps/angular-web/
  apps/react-admin/
  services/dotnet-api/
  services/node-worker/
  packages/shared-contracts/
  infra/
```

Expected outputs:

Angular app:

```text
overview.md
architecture.md
conventions.md
commands.md
dependencies.md
testing.md
security.md
boundaries.md
routes.md
components.md
state.md
api-client.md
```

.NET API:

```text
overview.md
architecture.md
conventions.md
commands.md
dependencies.md
testing.md
security.md
boundaries.md
api.md
auth.md
database.md
validation.md
errors.md
```

Node worker:

```text
overview.md
architecture.md
conventions.md
commands.md
dependencies.md
testing.md
security.md
boundaries.md
jobs.md
queues.md
retries.md
idempotency.md
```

Shared contracts:

```text
overview.md
architecture.md
conventions.md
commands.md
dependencies.md
testing.md
security.md
boundaries.md
schemas.md
exports.md
compatibility.md
public-api.md
```

Infra:

```text
overview.md
architecture.md
conventions.md
commands.md
dependencies.md
testing.md
security.md
boundaries.md
deployments.md
environments.md
secrets.md
ci-cd.md
permissions.md
```

---

## Implementation Order

### Phase 1: Registry

- Add `ContextFileDefinition`.
- Add universal file definitions.
- Add framework-specific definitions.
- Add public-safe flag.
- Add token budgets.

### Phase 2: Capability detection

- Detect frontend.
- Detect backend API.
- Detect database.
- Detect auth.
- Detect worker/queue.
- Detect shared package.
- Detect infrastructure.
- Detect CI/CD.

### Phase 3: Selection engine

- Select core files.
- Select capability files.
- Apply user config.
- Enforce safety files.
- Skip irrelevant files.

### Phase 4: Renderers

- Add renderer per universal file.
- Add renderer per high-value framework file.
- Use facts graph as input.
- Redact secrets before rendering.

### Phase 5: AGENTS.md load order

- Generate task-aware load order.
- Keep `AGENTS.md` compact.
- Link to relevant context files.

### Phase 6: CLI

- Add `agentctx plan`.
- Add `agentctx explain`.
- Add category/file-specific build flags.
- Improve build output.

### Phase 7: Incremental cache

- Store file-level input hashes.
- Rebuild only affected context files.
- Surface drift at file level.

### Phase 8: Tests and docs

- Add unit tests.
- Add integration fixture.
- Add docs page for context files.
- Add docs page for public-safe outputs.

---

## Documentation Additions

Add:

```text
docs/concepts/context-files.md
docs/concepts/framework-specific-context.md
docs/cli/plan.md
docs/cli/explain.md
docs/security/public-safe-context.md
```

Docs must explain:

- what each file is for
- when each file is generated
- how agents should load files
- how to override defaults
- how public-safe filtering works
- how token budgets are enforced

---

## Success Criteria

This addition is successful when:

1. Every context point has useful universal context.
2. Framework-specific files are generated only when relevant.
3. `AGENTS.md` stays compact.
4. Agents can load context by task type.
5. File-level drift detection works.
6. Token usage is measurable and controlled.
7. Public outputs exclude sensitive files.
8. The system works across JS, .NET, Node, frontend, backend, worker, package, data, and infrastructure contexts.

---

## Final Product Principle

The best AgentCtx output should feel like a senior engineer wrote a set of concise operational notes for every meaningful part of the repo.

Not too much.

Not too little.

Exactly the context an agent needs to make safe, correct, high-quality changes.
