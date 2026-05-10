# Compiler Pipeline

<div class="docs-hero">
  <span class="docs-kicker">Execution model</span>
  <h1>Compile repo state into task-aware operational context.</h1>
  <p class="docs-lead">
    The pipeline separates configuration, indexing, fact extraction, graph compilation, context planning, visibility policy, rendering, sync, and validation.
  </p>
</div>

## 1. Config

`agentctx.config.ts` defines targets, include/exclude rules, security defaults, CtxPoints, and context-file overrides.

## 2. Scope Resolution

The CLI decides whether the run is workspace-wide or focused on one or more CtxPoints. This is what prevents agents from treating a monorepo as one undifferentiated prompt.

## 3. File Indexing

The indexer walks the selected scope, ignores generated/cache/secret paths, hashes files, and creates deterministic input state.

## 4. Fact Extraction

Adapters read high-signal metadata and emit normalized facts: packages, frameworks, runtimes, scripts, routes, conventions, data surfaces, operations, auth, and dependencies.

Adapters do not generate Markdown. They emit evidence for the compiler.

## 5. Context Graph

The graph models apps, packages, dependency direction, and context-point relationships. This gives agents repository structure instead of unrelated file snippets.

## 6. Context Planning

The planner selects context files from the registry:

- universal files are always present
- root files appear at workspace scope
- framework and capability files appear only when evidence supports them
- safety files cannot be excluded by accident
- public-safe outputs receive only public-safe context

## 7. Context Surfaces

Targets render selected context into the surfaces each consumer needs:

- internal agent context: `AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot instructions
- public-safe context: `llms.txt`
- local context files: `.agentctx/context/*.md`

## 8. Sync and Drift

Sync writes generated outputs while preserving manual edits outside generated regions. Drift checks compare generated context with current repo state so context does not silently decay.

## 9. Validation

The repo quality gate runs typecheck, tests, build, and dual-agent review when configured. AgentCtx treats generated context as infrastructure, so it must be validated like infrastructure.

## Handoff

```text
config -> file index -> facts -> graph -> context plan -> context surfaces -> sync/check
```
