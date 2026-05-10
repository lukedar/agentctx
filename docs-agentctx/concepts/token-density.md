# Token Density

<div class="docs-hero">
  <span class="docs-kicker">Context economics</span>
  <h1>Token efficiency is architectural.</h1>
  <p class="docs-lead">
    AgentCtx reduces token waste by compiling task-relevant operational context instead of forcing agents to consume raw repository dumps.
  </p>
</div>

## Problem

More context is not the same as better context. Large prompts can bury critical facts, duplicate information, and force agents to reason across irrelevant files.

## AgentCtx Strategy

AgentCtx improves token density through:

- context points that bound operational domains
- capability-based context-file selection
- token budgets for generated files
- compact entrypoints that link deeper files
- public-safe filtering for external consumers
- drift checks that prevent stale context

## Raw Dump vs Compiled Pack

```text
large monorepo -> raw repo context -> agent
```

```text
large monorepo -> context planner -> task-aware context pack -> agent
```

The second model uses fewer irrelevant tokens, clearer operational boundaries, and stronger safety defaults.
