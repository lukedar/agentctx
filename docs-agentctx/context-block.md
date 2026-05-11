# Context Block

<div class="docs-hero">
  <span class="docs-kicker">Semantic context unit</span>
  <h1>Turn repository facts into task-aware operational context.</h1>
  <p class="docs-lead">
    A Context Block is an evidence-backed, task-aware, token-aware, visibility-aware unit before it is rendered into context files and context surfaces.
  </p>
</div>

## Why It Matters

Without Context Blocks, generated context collapses into either raw file dumps or hand-written summaries. Both are hard to scope, hard to audit, and easy to over-share.

With Context Blocks, AgentCtx can reason about operational meaning before rendering. Blocks let the compiler decide which facts belong together, which task needs them, which target can receive them, and how much token budget they should use.

## Operational Context Blocks

AgentCtx generates operational context instead of large narrative docs. Blocks should be compact, deterministic, high-signal, and directly useful to agents.

Standard structure:

```md
# Responsibilities
- auth routes
- JWT validation

# Dependencies
- shared contracts
- auth middleware

# Critical Invariants
- auth routes require JWT middleware
- shared contracts are source of truth

# Failure Modes
- JWT header changes break frontend auth

# Safe Commands
- pnpm test auth
- dotnet test Auth.Tests

# Useful For
- auth bugs
- route updates
- API contract changes

# Unsafe Changes
- bypassing JWT middleware
- changing shared contracts without consumers
```

Prefer responsibilities, dependencies, rules, invariants, risks, failure modes, safe commands, useful-for task signals, and unsafe-change boundaries. Avoid verbose narrative prose, large architectural essays, repeated explanations, and massive file inventories.

## Examples

<div class="docs-grid">
  <div class="docs-card docs-span-4"><h3>security rules</h3><p>Auth boundaries, secret handling, permission defaults, invariants, and sensitive paths.</p></div>
  <div class="docs-card docs-span-4"><h3>command safety</h3><p>Build, test, deploy, sync, check, and rollback commands with operational constraints.</p></div>
  <div class="docs-card docs-span-4"><h3>route shape</h3><p>Frontend routes, API routes, handlers, middleware, and runtime ownership.</p></div>
  <div class="docs-card docs-span-4"><h3>dependency boundaries</h3><p>Package relationships, shared contracts, imports, exports, and compatibility rules.</p></div>
  <div class="docs-card docs-span-4"><h3>public API</h3><p>External contracts, SDK surfaces, docs-safe endpoints, and versioning expectations.</p></div>
  <div class="docs-card docs-span-4"><h3>testing expectations</h3><p>Relevant test suites, safe commands, fixtures, and quality gates.</p></div>
</div>

## From Block To File

Context Blocks sit between repository facts and rendered outputs:

```text
repo facts -> context graph -> context blocks -> context files -> context surfaces
```

A Context Block is what AgentCtx reasons with. A Context File is what agents read.

For example, a security block may contribute to `security.md`, an API block may contribute to `api.md`, and a public-safe block may be eligible for `llms.txt`.
