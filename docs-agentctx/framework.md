# Framework Overview

<div class="docs-hero">
  <span class="docs-kicker">Framework</span>
  <h1>The reusable parts of AgentCtx.</h1>
  <p class="docs-lead">
    AgentCtx is a framework for compiling repository evidence into operational context that agents, CI, review systems, and public AI consumers can use safely.
  </p>
</div>

## Mental Model

AgentCtx is built from a small set of reusable concepts. Each part owns one decision so the system stays understandable as repositories, frameworks, and agent targets grow.

```text
repo evidence -> compiler -> Context Blocks -> Context Files -> Context Surfaces
```

## Core Parts

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Compiler</h3>
    <p>Turns scope, indexed files, extracted facts, and graph relationships into context that can be rendered.</p>
    <p><a href="/compiler">Open Compiler</a></p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context Points</h3>
    <p>Bound context to the operational domain a task actually touches.</p>
    <p><a href="/context-points">Open Context Points</a></p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context Block</h3>
    <p>The semantic unit AgentCtx reasons with before context becomes a file or surface.</p>
    <p><a href="/context-block">Open Context Block</a></p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context Files</h3>
    <p>Focused Markdown files such as <code>security.md</code>, <code>commands.md</code>, and <code>testing.md</code>.</p>
    <p><a href="/context-files">Open Context Files</a></p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Context Surfaces</h3>
    <p>Rendered outputs for internal agents, public-safe consumers, CI, and review workflows.</p>
    <p><a href="/targets">Open Context Surfaces</a></p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Public-Safe Context</h3>
    <p>Visibility rules that keep public AI outputs useful without exposing private operational context.</p>
    <p><a href="/public-safe-context">Open Public-Safe Context</a></p>
  </div>
</div>

## Supporting Parts

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Token Density</h3>
    <p>Context economics for loading fewer irrelevant tokens and preserving stronger task focus.</p>
    <p><a href="/concepts/token-density">Open Token Density</a></p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Framework Support</h3>
    <p>Adapters emit normalized evidence from frameworks without coupling the compiler to one stack.</p>
    <p><a href="/frameworks/support-matrix">Open Framework Support</a></p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Bench</h3>
    <p>Measures whether structured context improves agent outcomes.</p>
    <p><a href="/bench/overview">Open Bench</a></p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Dual Agent Runner</h3>
    <p>Uses a Builder and Evaluator loop to keep framework changes visible and gated.</p>
    <p><a href="/quality-gate">Open Dual Agent Runner</a></p>
  </div>
</div>

## Senior Developer Rule

When changing AgentCtx, first identify which framework part owns the decision:

- use adapters for framework evidence
- use core for graph, selection, visibility, and context policy
- use targets for rendering
- use CLI commands for orchestration
- use Bench and Dual Agent Runner for evidence and quality gates
