# CMS Platform

<div class="docs-hero">
  <span class="docs-kicker">Very high priority</span>
  <h1>Plugins, permissions, editor workflows, APIs, workers, and public docs.</h1>
  <p class="docs-lead">CMS platforms are context-heavy because agents must distinguish editor behavior, plugin boundaries, API contracts, permissions, and public-safe documentation.</p>
</div>

## System Overview

A CMS often combines an authoring frontend, editor tooling, plugin runtime, APIs, background processing, schemas, permissions, and public documentation. The same repo can serve internal agents and external AI context consumers.

## Typical Repository Structure

```text
apps/admin
packages/editor
packages/plugins
services/content-api
workers/publishing
schemas
docs
```

## Common AI Context Problems

- plugin registration changes break editor loading
- permission checks are missed during API edits
- public docs receive internal admin context
- schema changes are made without migration or worker awareness
- agents over-load token-heavy docs for narrow API tasks

## Recommended Context Points

- `frontend`
- `editor`
- `api`
- `plugins`
- `workers`
- `schemas`
- `permissions`

## Example Context Mesh

```text
editor -> plugins
frontend -> api -> schemas
workers -> schemas
permissions -> api, editor
```

## Recommended Context Surfaces

- `AGENTS.md` for internal agent orientation
- point-level context for editor, plugins, and API ownership
- `llms.txt` for public-safe docs
- future `public-manifest.json` for public-safe context inventory

## Example Task-aware Context Planning

Task: fix a role-based publishing bug.

Loaded:

- `permissions.md`
- `api.md`
- `routes.md`
- `testing.md`

Excluded:

- `infra.md`
- unrelated plugin docs
- private deployment notes

## Benchmark Example

| Metric | No Context | AgentCtx |
|---|---:|---:|
| Tokens | 118k | 31k |
| Runtime | 16m | 9m |
| Permission mistakes | 4 | 0 |
| Public-safe leaks | 2 | 0 |

## Where AgentCtx Adds Value

AgentCtx keeps public and internal surfaces separate while giving agents the operational context they need for safe CMS changes.

## Operational Context Demonstration

```md
# Responsibilities
- editor permissions
- plugin registration
- content API contracts

# Critical Invariants
- publishing requires permission checks
- schemas drive API and worker behavior

# Failure Modes
- plugin registration changes break editor loading

# Useful For
- permission bugs
- plugin updates
- schema changes
```
