# Compiler

<div class="docs-hero">
  <span class="docs-kicker">Reusable compiler parts</span>
  <h1>The compiler turns repo state into operational context.</h1>
  <p class="docs-lead">
    AgentCtx compiles repositories into operational context optimized for AI systems through reusable compiler stages senior teams can reason about independently.
  </p>
</div>

## Why It Matters

The compiler is the layer that keeps AgentCtx from becoming a collection of templates. It separates repo discovery from operational meaning, and operational meaning from final output formats.

For a senior developer, the important question is not “which Markdown file gets written?” It is “which reusable stage owns this decision?”

## Reusable Parts

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Scope Resolution</h3>
    <p>Decides whether the run is workspace-wide or focused on one or more CtxPoints.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>File Indexing</h3>
    <p>Builds deterministic input state from source, config, docs, manifests, and high-signal metadata.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Fact Extraction</h3>
    <p>Adapters emit normalized facts with evidence instead of writing Markdown directly.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context Graph</h3>
    <p>Models packages, apps, dependencies, boundaries, and point-to-point relationships.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context Blocks</h3>
    <p>Shapes compact operational context around responsibilities, dependencies, invariants, risks, and useful tasks.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Target Renderers</h3>
    <p>Formats selected context for <code>AGENTS.md</code>, <code>llms.txt</code>, and other consumers.</p>
  </div>
</div>

## Handoff

```text
scope -> file index -> facts -> graph -> context blocks -> target renderers
```

## Speed Contract

AgentCtx is a compiler, so repeated work belongs in the compiler, not in every adapter.

- File indexing produces one deterministic path list for the scope.
- Scan context precomputes path helpers and caches text/JSON reads.
- Adapters emit compact operational facts; they do not rescan targets or render Markdown.
- Plugin extraction can reuse detection work when a plugin supports combined extraction.

## Ownership Rules

- Scope logic decides what part of the repo is in play.
- Adapters detect framework evidence and emit facts.
- Core owns graph building, block selection, visibility policy, and token-aware planning.
- Targets render selected context; they do not rescan the repo.
- CLI commands orchestrate build, sync, check, plan, and explain.

This split keeps the system extensible. A new framework adds facts. A new context policy changes selection. A new target changes rendering.
