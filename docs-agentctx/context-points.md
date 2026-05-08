# Context Points

<div class="docs-hero">
  <span class="docs-kicker">Boundary-aware context</span>
  <h1>Context points make the compiler work per domain, not just per repo.</h1>
  <p class="docs-lead">
    A context point is a deliberate boundary inside your repo that gets its own curated agent context.
    Use it for apps, packages, services, and docs surfaces that need focused outputs.
  </p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-6 docs-card--accent">
    <h3>Why teams use points</h3>
    <div class="docs-chip-row">
      <span class="docs-chip">token efficiency</span>
      <span class="docs-chip">performance</span>
      <span class="docs-chip">security</span>
      <span class="docs-chip">ownership</span>
    </div>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Typical boundaries</h3>
    <p><code>apps/api</code>, <code>apps/web</code>, <code>packages/shared</code>, <code>services/payments</code></p>
  </div>
</div>

## Mental model

<img src="/diagrams/context-points.svg" alt="Workspace vs context points diagram" />

<div class="docs-grid">
  <div class="docs-card docs-span-6">
    <h3>Workspace scope</h3>
    <p>Repo-wide conventions, tooling, and shared facts that apply across the whole monorepo.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Point scope</h3>
    <p>The local rules, APIs, and files for one boundary. The compiler uses the same pipeline, but with a narrower view.</p>
  </div>
</div>

## Build pipeline

<img src="/diagrams/pipeline.svg" alt="AgentCtx pipeline diagram" />

<div class="docs-flow">
  <div class="docs-flow__step">
    <div class="docs-flow__index">1</div>
    <div>
      <h3 class="docs-flow__title">Build the workspace first</h3>
      <p class="docs-flow__body"><code>agentctx build</code> compiles the repo-wide view and writes the workspace artifacts.</p>
    </div>
  </div>
  <div class="docs-flow__step">
    <div class="docs-flow__index">2</div>
    <div>
      <h3 class="docs-flow__title">Add one or more points</h3>
      <p class="docs-flow__body"><code>agentctx build --point api</code> compiles a focused boundary alongside the workspace.</p>
    </div>
  </div>
  <div class="docs-flow__step">
    <div class="docs-flow__index">3</div>
    <div>
      <h3 class="docs-flow__title">Sync the generated outputs</h3>
      <p class="docs-flow__body"><code>agentctx sync</code> writes the generated files into the repo root and each point path.</p>
    </div>
  </div>
</div>

## Output layout

<div class="docs-grid">
  <div class="docs-panel docs-span-6">
    <h3>Workspace outputs</h3>
    <p><code>.agentctx/workspace/facts.json</code></p>
    <p><code>.agentctx/workspace/graph.json</code></p>
    <p><code>.agentctx/workspace/metrics.json</code></p>
    <p><code>.agentctx/workspace/context/*.md</code></p>
    <p><code>.agentctx/workspace/out/*</code></p>
  </div>
  <div class="docs-panel docs-span-6">
    <h3>Point outputs</h3>
    <p><code>.agentctx/points/&lt;point&gt;/facts.json</code></p>
    <p><code>.agentctx/points/&lt;point&gt;/graph.json</code></p>
    <p><code>.agentctx/points/&lt;point&gt;/metrics.json</code></p>
    <p><code>.agentctx/points/&lt;point&gt;/context/*.md</code></p>
    <p><code>.agentctx/points/&lt;point&gt;/out/*</code></p>
  </div>
</div>

## Configuration

<div class="docs-panel">
  <h3>Define points in `agentctx.config.ts`</h3>
<pre><code>export default {
  targets: ["agents-md", "claude", "cursor", "copilot", "llms"],
  contextPoints: [
    { name: "api", path: "apps/api" },
    { name: "web", path: "apps/web" },
  ],
}</code></pre>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Tight include sets</h3>
    <p>Use manifests and key folders. High signal beats full source.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Generated paths</h3>
    <p><code>.agentctx</code>, <code>dist</code>, <code>build</code>, and cache folders stay excluded by default.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Dependencies</h3>
    <p><code>dependsOn</code> models explicit point relationships for future affected workflows.</p>
  </div>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Dogfooding</h3>
  <p>This repo uses context points for <code>core</code>, <code>cli</code>, <code>adapters</code>, <code>targets</code>, <code>dual-agent-runner</code>, <code>dual-agent-runner-ui</code>, and <code>docs-agentctx</code>.</p>
</div>
