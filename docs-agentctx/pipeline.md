# Pipeline

<div class="docs-hero">
  <span class="docs-kicker">Execution model</span>
  <h1>Follow the compiler from repo input to generated context.</h1>
  <p class="docs-lead">This page defines the language of the framework and explains each pipeline step in the order AgentCtx executes it.</p>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Why this order matters</h3>
  <p>Each stage narrows and stabilizes the repo state before handing it to the next one. The pipeline stays explainable because every stage has one job and one output model.</p>
</div>

## 1. Config

<div class="docs-grid">
  <div class="docs-card docs-span-8">
    <h3>What happens</h3>
    <p><code>agentctx.config.ts</code> defines targets, include/exclude rules, budgets, security defaults, and context points.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Output</h3>
    <p>A normalized runtime config used by every later stage.</p>
  </div>
</div>

The compiler starts from config because the repo must describe its own boundaries before anything can be indexed or rendered.

## 2. Scope resolution

<div class="docs-grid">
  <div class="docs-card docs-span-8">
    <h3>What happens</h3>
    <p>The CLI decides whether the run is workspace-wide or focused on one or more context points.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Output</h3>
    <p>A scoped config view for the workspace or each selected point.</p>
  </div>
</div>

This is what makes the framework boundary-aware instead of repo-wide only.

## 3. File indexing

<div class="docs-grid">
  <div class="docs-card docs-span-8">
    <h3>What happens</h3>
    <p>The indexer walks the selected scope, applies include/exclude rules, ignores generated paths, and hashes the remaining files.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Output</h3>
    <p>A deterministic file index.</p>
  </div>
</div>

This stage is where noise, recursion, and unstable ordering are removed from the pipeline.

## 4. Fact extraction

<div class="docs-grid">
  <div class="docs-card docs-span-8">
    <h3>What happens</h3>
    <p>Adapters scan the indexed files and emit normalized facts such as packages, frameworks, runtimes, scripts, routes, and conventions.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Output</h3>
    <p>A sorted fact set.</p>
  </div>
</div>

Facts are intentionally small so they are testable, stable, and safe to persist.

## 5. Graph compilation

<div class="docs-grid">
  <div class="docs-card docs-span-8">
    <h3>What happens</h3>
    <p>The compiler turns facts into packages, apps, relationships, and scope-aware structure.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Output</h3>
    <p>A context graph.</p>
  </div>
</div>

The graph is the framework’s structural model. It answers how the repo is connected, not just what was detected.

## 6. Context block planning

<div class="docs-grid">
  <div class="docs-card docs-span-8">
    <h3>What happens</h3>
    <p>The planner turns the graph into readable context blocks such as architecture, conventions, testing, and workflows.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Output</h3>
    <p>A bounded set of rendered context blocks for the current scope.</p>
  </div>
</div>

Example:
- point: <code>packages/core</code>
- blocks: <code>architecture</code>, <code>testing</code>, <code>workflows</code>

## 7. Target rendering

<div class="docs-grid">
  <div class="docs-card docs-span-8">
    <h3>What happens</h3>
    <p>Targets format the same context blocks into instruction files for different agents and tools.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Output</h3>
    <p>Generated files in the build output directories.</p>
  </div>
</div>

Targets are renderers only. They do not rescan the repo or reinterpret the graph independently.

## 8. Sync

<div class="docs-grid">
  <div class="docs-card docs-span-8">
    <h3>What happens</h3>
    <p>Built outputs are written into the repo root or point paths, with generated blocks updated in place.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Output</h3>
    <p>Repo-visible instruction files and point-local context files.</p>
  </div>
</div>

Sync is the mutation layer. It must be safe, deterministic, and respectful of manual edits outside generated regions.

## 9. Drift and validation

<div class="docs-grid">
  <div class="docs-card docs-span-8">
    <h3>What happens</h3>
    <p>The repo is checked for stale outputs and fact drift, then validated through the broader quality gate.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Output</h3>
    <p>Pass/fail status plus drift and sync reports.</p>
  </div>
</div>

This stage keeps the generated context aligned with the current repo state and prevents silent context decay.

## Data handoff

- Config -> file index
- File index -> facts
- Facts -> graph
- Graph -> context blocks
- Context blocks -> targets
- Built outputs -> sync and check
