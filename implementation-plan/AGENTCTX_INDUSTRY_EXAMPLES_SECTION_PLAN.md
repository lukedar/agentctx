# AgentCtx Industry Examples Section Plan

## Purpose

Add a dedicated “Industry Examples” section to the AgentCtx docs that demonstrates where operational context coordination becomes difficult and where AgentCtx provides practical value.

The section should:
- explain real engineering context problems
- show how AgentCtx applies to complex systems
- prioritize examples by operational necessity
- demonstrate token and performance improvements
- show public-safe context surfaces
- support benchmark-backed explanations

The section should feel:
- technical
- operational
- benchmark-backed
- practical

Not:
- marketing-heavy

---

# Docs Navigation

Add:

Industry Examples

Recommended nav:

- Why AgentCtx
- Architecture
- Frameworks
- Industry Examples
- Bench
- CLI
- Docs
- GitHub

---

# Docs Structure

docs/
  industry-examples/
    overview.md

    polyglot-monorepo.md
    cms-platform.md
    ecommerce-platform.md
    internal-developer-platform.md
    api-platform.md
    ai-native-startup.md
    enterprise-monorepo.md
    regulated-enterprise.md

    shared/
      benchmark-template.md
      context-point-template.md
      token-reduction-template.md
      diagrams/

---

# Example Prioritization

Order examples by:
1. operational complexity
2. AI-context difficulty
3. monorepo complexity
4. security requirements
5. token pressure
6. likelihood of AI adoption

---

# Shared Example Page Template

# Example: <System>

## System Overview

## Typical Repository Structure

## Common AI Context Problems

## Why Operational Context Matters

## Recommended Context Points

## Example Context Mesh

## Recommended Context Surfaces

## Example Context Blocks

## Example Task-aware Context Planning

## Example Benchmark Tasks

## Example Token Reduction Areas

## Benchmark Example

## Where AgentCtx Adds Value

---

# Example 1 — Polyglot Monorepo

Priority: Highest

Example stack:
- Angular frontend
- .NET API
- Node workers
- shared contracts
- infra

Why this matters:
- Context Points
- Context Mesh
- framework adapters
- task-aware planning
- token-heavy workflows

Recommended Context Points:
- frontend
- api
- worker
- shared-contracts
- infra

Example Context Mesh:
frontend -> api -> database
shared-contracts -> frontend/api/worker
worker -> queue -> api

Benchmark Example:

| Metric | No Context | AgentCtx |
|---|---:|---:|
| Tokens | 92k | 38k |
| Runtime | 14m | 8m |
| Success | 42% | 82% |
| Irrelevant edits | 9 | 1 |

---

# Example 2 — CMS Platform

Priority: Very High

Why this matters:
- plugin systems
- public/private boundaries
- permissions
- public-safe context
- token-heavy docs

Typical systems:
- frontend
- editor tooling
- plugins
- APIs
- workers
- schemas
- permissions

Recommended Context Points:
- frontend
- editor
- api
- plugins
- workers
- schemas
- permissions

Public-safe surfaces:
- llms.txt
- public-manifest.json
- public architecture
- public editor workflows

---

# Example 3 — Ecommerce Platform

Priority: High

Why this matters:
- payments
- auth
- inventory
- security-sensitive workflows

Typical systems:
- frontend
- checkout
- payments
- inventory
- workers
- auth

Recommended Context Points:
- frontend
- checkout
- payments
- inventory
- orders
- auth

Focus:
- operational boundaries
- security-sensitive context
- task-aware planning

---

# Example 4 — Internal Developer Platform

Priority: High

Why this matters:
- CI systems
- deployment workflows
- observability
- infrastructure tooling

Typical systems:
- CI
- deployments
- observability
- internal APIs
- infra

Recommended Context Points:
- ci
- deployments
- observability
- infra
- internal-api

---

# Example 5 — API Platform

Priority: Medium-High

Why this matters:
- public-safe context
- OpenAPI
- SDKs
- llms.txt

Typical systems:
- APIs
- auth
- SDKs
- contracts
- public docs

Recommended Context Surfaces:
- llms.txt
- llms-full.txt
- public-manifest.json

---

# Example 6 — AI-Native Startup

Priority: Medium

Why this matters:
- fast-moving repos
- multi-agent workflows
- token-heavy experimentation

Typical systems:
- frontend
- backend
- workers
- prompts
- agents
- infra

---

# Example 7 — Enterprise Monorepo

Priority: Medium-High

Why this matters:
- governance
- visibility boundaries
- token scale
- affected builds

Key features to emphasize:
- Context Points
- Context Mesh
- token planning
- visibility classification

---

# Example 8 — Regulated Enterprise

Priority: Medium

Industries:
- healthcare
- finance
- government

Why this matters:
- public-safe context
- compliance
- security
- operational boundaries

Visibility examples:
- public
- internal
- sensitive
- secret

---

# Shared Themes Across All Examples

Every example should reinforce:

## Context Points
Operational boundaries reduce:
- irrelevant context
- token waste
- unsafe edits

## Context Mesh
System relationships become explicit.

## Task-aware Context Planning
Only relevant context is loaded.

## Public-safe Context
Different systems consume different visibility levels.

## Benchmark-backed Improvements
Show:
- token reduction
- runtime improvements
- fewer irrelevant edits
- fewer security findings

---

# Shared Visuals

## Current Industry Flow

repo -> giant prompt -> agent

## AgentCtx Flow

repo
  -> semantic context compiler
  -> operational context infrastructure
  -> task-aware context surfaces
  -> autonomous engineering systems

---

# Documentation Development Batches

## Batch 1 — Foundation
- add navigation
- add overview page
- add shared templates
- add benchmark table templates
- add shared diagrams

## Batch 2 — Polyglot Monorepo
- Angular + .NET example
- Context Mesh
- benchmark visuals
- task-aware planning examples

## Batch 3 — CMS + Ecommerce
- plugin boundaries
- auth/payment boundaries
- public-safe context examples
- benchmark sections

## Batch 4 — Platform + API
- CI workflows
- llms.txt examples
- public-manifest examples
- benchmark sections

## Batch 5 — Enterprise + Governance
- visibility classification
- governance
- compliance
- operational boundaries

## Batch 6 — Shared Benchmark and Visual Pass
- unify benchmark visuals
- unify diagrams
- unify token charts
- consistency review

---

# Final Recommendation

The Industry Examples section should become:
the practical proof layer of the docs.

The strongest examples are:
1. Polyglot monorepo
2. CMS platform
3. Ecommerce platform
4. Internal developer platform
5. API platform

because they best demonstrate:
- operational boundaries
- token-heavy workflows
- public/private context
- security-sensitive systems
- benchmarkable improvements
- enterprise relevance
