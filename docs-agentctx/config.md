# Configuration

<div class="docs-hero">
  <span class="docs-kicker">Runtime contract</span>
  <h1>Configure the compiler once, then let the pipeline stay deterministic.</h1>
  <p class="docs-lead">`agentctx.config.ts` defines targets, scope behavior, and point boundaries. Everything else is derived from that normalized config.</p>
</div>

## Minimal example

<div class="docs-panel">
<pre><code>export default {
  targets: ["agents-md", "claude", "cursor", "copilot", "llms"],
}</code></pre>
</div>

## Context points

Use `contextPoints` to define boundaries inside your repo that should get **their own** context outputs.

<div class="docs-panel">
<pre><code>export default {
  targets: ["agents-md", "claude", "cursor", "copilot", "llms"],
  contextPoints: [
    {
      name: "api",
      path: "apps/api",
      targets: ["claude", "copilot"],
      exclude: ["apps/api/generated/**"],
      dependsOn: ["shared"],
    },
    {
      name: "shared",
      path: "packages/shared",
    },
  ],
}</code></pre>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>`name`</h3>
    <p>Identifier used by `--point` and sync/build selection.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>`path`</h3>
    <p>Directory relative to the repo root.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>`targets`</h3>
    <p>Override the target set for one point when needed.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>`include` / `exclude`</h3>
    <p>Control what the point scans inside its own boundary.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3>`dependsOn`</h3>
    <p>Express point-to-point dependencies for future affected workflows.</p>
  </div>
</div>

## Notes
<div class="docs-callout">
  <h3>Scanning rules</h3>
  <p>Common generated paths are excluded by default even inside nested points, including <code>.agentctx</code>, <code>dist</code>, <code>build</code>, <code>dist-server</code>, and <code>.vitepress/cache</code>.</p>
</div>
