# AgentCtx

<div class="docs-hero">
  <span class="docs-kicker">Deterministic context compiler</span>
  <h1>Agent context for any repo, any framework, and any agent.</h1>
  <p class="docs-lead">
    AgentCtx compiles repo metadata into deterministic CtxBlocks that adapt to the codebase and render into the instruction files your agents actually use.
  </p>
  <div class="docs-chip-row">
    <span class="docs-chip">any repo</span>
    <span class="docs-chip">any framework</span>
    <span class="docs-chip">any agent</span>
    <span class="docs-chip">metadata-first</span>
    <span class="docs-chip">deterministic output</span>
  </div>
</div>

## Why AgentCtx

<div class="docs-grid">
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Any repo</h3>
    <p>Use the same compiler model for monorepos, services, libraries, documentation, infrastructure, data, and Python-heavy research code.</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Any framework</h3>
    <p>Adapters turn framework-specific evidence into normalized facts, so React, Angular, Node, .NET, Python, and future stacks can share the same pipeline.</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Any agent</h3>
    <p>Targets render the same CtxBlocks into <code>AGENTS.md</code>, <code>CLAUDE.md</code>, <code>llms.txt</code>, and editor-specific formats without rescanning the repo.</p>
  </div>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>The contract</h3>
  <p>Repo files produce facts. Facts compile into a graph. The graph plans CtxBlocks. Targets render those blocks for each agent. That separation keeps the system portable across teams, frameworks, and tools.</p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-6 docs-card--accent">
    <h3>Pipeline</h3>
    <p>Follow the compiler from config to drift checks, with the framework language defined in one place.</p>
    <p><a href="/pipeline">Open Pipeline</a></p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Architecture schematic</h3>
    <p>The code map explains package boundaries, compiler contracts, and why the framework is arranged this way.</p>
    <p><a href="/architecture">Open Architecture</a></p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>CtxPoints</h3>
    <p>Points let the same compiler run at the workspace level or inside an app or package boundary.</p>
    <p><a href="/context-points">Open CtxPoints</a></p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>CtxBlocks</h3>
    <p>See the reusable block catalog and the team map for frontend, backend, SRE, quant, and data usage.</p>
    <p><a href="/context-blocks">Open CtxBlocks</a></p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Targets</h3>
    <p>See how the shared CtxBlock model becomes <code>AGENTS.md</code>, <code>CLAUDE.md</code>, <code>llms.txt</code>, and the other shipped outputs.</p>
    <p><a href="/targets">Open Targets</a></p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Benchmark</h3>
    <p>Compare the same task with no generated context and with a selected AgentCtx CtxBlock.</p>
    <p><a href="/benchmark">Open Benchmark</a></p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Tests</h3>
    <p>Review generated Benchmark results by repo, CtxPoint, CtxBlock, performance, token usage, and agent compute.</p>
    <p><a href="/tests">Open Tests</a></p>
  </div>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Start here</h3>
  <p>Read <a href="/pipeline">Pipeline</a> for the canonical language, <a href="/context-points">CtxPoints</a> for boundary semantics, and <a href="/context-blocks">CtxBlocks</a> for the block catalog and team map.</p>
</div>

## Principles

<div class="docs-grid">
  <div class="docs-card docs-span-6">
    <h3>Deterministic</h3>
    <p>Stable ordering, no timestamps, and explicit filtering keep repeated runs identical when the repo does not change.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Local-first</h3>
    <p>The compiler runs on the repo you already have. There is no source exfiltration or network dependency in the core flow.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Secure by default</h3>
    <p>Redaction and ignore rules keep secrets out of generated outputs and avoid scanning common secret files.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Metadata-first</h3>
    <p>Prefer manifests and config over full source dumps. The point is to explain the repo, not reproduce it.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Portable</h3>
    <p>Framework adapters, CtxBlocks, and targets are separate layers, so support can expand without coupling one repo shape to one agent format.</p>
  </div>
</div>
