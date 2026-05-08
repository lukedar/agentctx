# AgentCtx

<div class="docs-hero">
  <span class="docs-kicker">Deterministic context compiler</span>
  <h1>Compile repo metadata into agent-ready context.</h1>
  <p class="docs-lead">
    AgentCtx scans high-value repo metadata, builds a facts graph, plans context blocks, and renders deterministic outputs your team can review and commit.
    The result is a local-first workflow that stays focused on repo structure instead of dumping raw source.
  </p>
  <div class="docs-chip-row">
    <span class="docs-chip">metadata-first</span>
    <span class="docs-chip">workspace + points</span>
    <span class="docs-chip">deterministic output</span>
    <span class="docs-chip">safe sync</span>
    <span class="docs-chip">quality gate</span>
  </div>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-6 docs-card--accent">
    <h3>Architecture schematic</h3>
    <p>The code map explains the compiler stages, module boundaries, and why the framework is arranged this way.</p>
    <p><a href="/architecture">Open Architecture</a></p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Context points</h3>
    <p>Points let the same compiler run at the workspace level or inside an app/package boundary.</p>
    <p><a href="/context-points">Open Context Points</a></p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Quality gate</h3>
    <p>The dual-agent evaluator keeps changes deterministic, reviewable, and continuously checked.</p>
    <p><a href="/quality-gate">Open Dual Agent Runner</a></p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Quickstart</h3>
    <p><code>pnpm context:build</code> compiles outputs, <code>pnpm context:sync</code> writes them, and <code>pnpm context:check</code> validates drift.</p>
  </div>
</div>

## What it does

<div class="docs-flow">
  <div class="docs-flow__step">
    <div class="docs-flow__index">1</div>
    <div>
      <h3 class="docs-flow__title">Scan high-signal metadata</h3>
      <p class="docs-flow__body">Package manifests, config files, scripts, route conventions, API/DB artifacts, and framework dependencies become the input signal.</p>
    </div>
  </div>
  <div class="docs-flow__step">
    <div class="docs-flow__index">2</div>
    <div>
      <h3 class="docs-flow__title">Compile a graph</h3>
      <p class="docs-flow__body">Facts are normalized into nodes, relationships, and context-point boundaries so the repo structure becomes explicit.</p>
    </div>
  </div>
  <div class="docs-flow__step">
    <div class="docs-flow__index">3</div>
    <div>
      <h3 class="docs-flow__title">Render deterministic outputs</h3>
      <p class="docs-flow__body">Targets turn the same model into <code>AGENTS.md</code>, <code>CLAUDE.md</code>, <code>llms.txt</code>, and other instruction files.</p>
    </div>
  </div>
</div>

## Workflow

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Build</h3>
    <p><code>pnpm context:build</code> compiles workspace and point outputs into <code>.agentctx</code>.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Sync</h3>
    <p><code>pnpm context:sync</code> writes the generated files into the repo without clobbering manual edits.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Check</h3>
    <p><code>pnpm context:check</code> validates drift and stale outputs before a change is considered done.</p>
  </div>
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
</div>
