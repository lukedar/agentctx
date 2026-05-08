# Targets

<div class="docs-hero">
  <span class="docs-kicker">Render layer</span>
  <h1>Targets turn the shared context-block model into tool-specific instruction files.</h1>
  <p class="docs-lead">Targets do not scan the repo. They only format the same compiler output into different agent/runtime shapes.</p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-6 docs-card--accent">
    <h3>MVP targets</h3>
    <div class="docs-chip-row">
      <span class="docs-chip">AGENTS.md</span>
      <span class="docs-chip">CLAUDE.md</span>
      <span class="docs-chip">Cursor rules</span>
      <span class="docs-chip">Copilot instructions</span>
      <span class="docs-chip">llms.txt</span>
    </div>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Output paths</h3>
    <p><code>.agentctx/workspace/out/</code> and <code>.agentctx/points/&lt;point&gt;/out/</code> are the generated staging areas before sync writes them into place.</p>
  </div>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Rule of thumb</h3>
  <p>Do not add a target until it has a real renderer and a stable output contract.</p>
</div>
