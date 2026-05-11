# Why AgentCtx

<div class="docs-hero">
  <span class="docs-kicker">The context bottleneck</span>
  <h1>The future bottleneck is context coordination.</h1>
  <p class="docs-lead">
    Coding agents can generate code, but real software engineering requires operational understanding: architecture, ownership, workflows, security rules, dependency boundaries, and validation paths.
  </p>
</div>

## The Current Flow

```text
repository -> giant prompt / raw context dump -> agent -> code change
```

This forces AI systems to repeatedly rediscover:

- architecture
- operational boundaries
- security rules
- ownership
- workflows
- dependency direction
- validation expectations

The result is token waste, inconsistent understanding, hallucinated architecture, unsafe edits, and poor monorepo scalability.

## The AgentCtx Flow

```text
repository
  -> semantic context compiler
  -> operational context
  -> task-aware context
  -> AI systems
```

AgentCtx turns repository understanding into compiled infrastructure. Agents consume structured context instead of reconstructing it from scratch.

## Operational Context

Current systems often treat repositories as raw material for a giant prompt. That forces AI systems to repeatedly rediscover architecture, boundaries, workflows, dependencies, and validation paths.

AgentCtx changes the model by compiling repository evidence into operational context optimized for AI systems.

## Why Operational Context Matters

AI systems do not primarily need more prose. They need clear operational understanding:

- responsibilities
- dependencies
- invariants
- risks
- failure modes
- safe commands
- operational boundaries

## What AgentCtx Adds

<div class="docs-grid">
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Evidence-backed facts</h3>
    <p>Adapters extract normalized facts from manifests, config, routes, workflows, and other high-signal files.</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Context graph</h3>
    <p>The compiler models apps, packages, relationships, and context-point boundaries.</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Context surfaces</h3>
    <p>Targets render operational context for internal agents, public consumers, and future automation systems.</p>
  </div>
</div>

AgentCtx exists because autonomous engineering systems need context infrastructure, not larger undifferentiated prompts.

AgentCtx compiles repositories into reusable operational context optimized for AI systems.
