# CtxBlocks

<div class="docs-hero">
  <span class="docs-kicker">Block catalog</span>
  <h1>Reusable CtxBlocks for focused agent context.</h1>
  <p class="docs-lead">
    CtxBlocks are the compiler’s output units. They keep stable names across repos while their content adapts to the frameworks, tools, and files detected in the current scope.
  </p>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Why blocks matter</h3>
  <p>A CtxBlock is generic at the boundary and specific inside. The block may be called <code>frontend</code>, <code>api</code>, or <code>data</code>, but its content is shaped by facts from React, Angular, Node, .NET, Python, SRE tooling, or data workflows.</p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Architecture</h3>
    <p>The repo shape: scope, languages, frameworks, packages, apps, and internal dependencies.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Conventions</h3>
    <p>The repo rules: tooling, project habits, and change guidance.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Runtime</h3>
    <p>The execution surface: Node, Python, or .NET entrypoints and manifests.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Frontend</h3>
    <p>The UI surface: React, Angular, and app-shell structures when a frontend really exists.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>API</h3>
    <p>The service surface: routes, contracts, and API frameworks across backend stacks.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Database</h3>
    <p>The persistence surface: schema, migrations, and storage artifacts.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Operations</h3>
    <p>The operational surface: deployment, infrastructure, observability, and runbooks.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Data</h3>
    <p>The data surface: sources, jobs, quality checks, notebooks, and data-oriented Python work.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Testing</h3>
    <p>The validation surface: test runners, configs, and expectations.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Workflows</h3>
    <p>The day-to-day surface: install, build, test, sync, and release commands.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Glossary</h3>
    <p>The reference surface: environment variable names and other compact terms.</p>
  </div>
</div>

## Team Map

<div class="docs-callout">
  <h3>How to read the matrix</h3>
  <p>Each column shows the blocks a team is most likely to consume. The compiler still emits blocks only when the relevant signals exist in that CtxPoint or workspace.</p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Frontend</h3>
    <div class="docs-chip-row">
      <span class="docs-chip">architecture</span>
      <span class="docs-chip">conventions</span>
      <span class="docs-chip">runtime</span>
      <span class="docs-chip">frontend</span>
      <span class="docs-chip">api</span>
      <span class="docs-chip">testing</span>
      <span class="docs-chip">workflows</span>
    </div>
    <p>For UI teams that need the app shape, frontend conventions, and the small set of supporting blocks that matter to shipping interface work.</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>Backend</h3>
    <div class="docs-chip-row">
      <span class="docs-chip">architecture</span>
      <span class="docs-chip">conventions</span>
      <span class="docs-chip">runtime</span>
      <span class="docs-chip">api</span>
      <span class="docs-chip">database</span>
      <span class="docs-chip">testing</span>
      <span class="docs-chip">workflows</span>
    </div>
    <p>For service teams that need runtime, routes, persistence, and validation without inheriting frontend or ops noise.</p>
  </div>
  <div class="docs-card docs-span-4 docs-card--accent">
    <h3>SRE</h3>
    <div class="docs-chip-row">
      <span class="docs-chip">architecture</span>
      <span class="docs-chip">conventions</span>
      <span class="docs-chip">runtime</span>
      <span class="docs-chip">operations</span>
      <span class="docs-chip">testing</span>
      <span class="docs-chip">workflows</span>
    </div>
    <p>For platform teams that care about deployment, infrastructure, observability, and runbooks. Unrelated frontend or data blocks stay out unless the point really needs them.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Quant</h3>
    <div class="docs-chip-row">
      <span class="docs-chip">architecture</span>
      <span class="docs-chip">conventions</span>
      <span class="docs-chip">runtime</span>
      <span class="docs-chip">data</span>
      <span class="docs-chip">testing</span>
      <span class="docs-chip">workflows</span>
    </div>
    <p>For Python-heavy research and backtesting teams. The `data` block keeps sources, jobs, and quality together so reproducibility stays visible without bloating the output.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>Data</h3>
    <div class="docs-chip-row">
      <span class="docs-chip">architecture</span>
      <span class="docs-chip">conventions</span>
      <span class="docs-chip">runtime</span>
      <span class="docs-chip">data</span>
      <span class="docs-chip">database</span>
      <span class="docs-chip">operations</span>
      <span class="docs-chip">testing</span>
      <span class="docs-chip">workflows</span>
    </div>
    <p>For data platform and analytics teams. The `data` block stays generic, but it still shows the parts that matter: sources, jobs, quality, notebooks, and batch-oriented Python work.</p>
  </div>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Portable by design</h3>
  <p>The block names stay stable while the content changes with repo signals. That keeps the model portable across repo shapes, framework stacks, and agent targets without flattening every team into the same output.</p>
</div>
