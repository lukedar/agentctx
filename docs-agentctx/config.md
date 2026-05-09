# Configuration

<div class="docs-hero">
  <span class="docs-kicker">Runtime contract</span>
  <h1>Configure the compiler once, then let the pipeline stay deterministic.</h1>
  <p class="docs-lead">`agentctx.config.ts` defines targets, scan rules, budgets, security defaults, and CtxPoint boundaries. Everything else is derived from that normalized config.</p>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Pipeline reference</h3>
  <p>Config is the first stage of the compiler. Use <a href="/pipeline">Pipeline</a> for the full execution order and terminology.</p>
</div>

## Minimal example

<div class="docs-panel">
<pre><code>export default {
  targets: ["agents-md", "claude", "cursor", "copilot", "llms"],
}</code></pre>
</div>

## CtxPoints

Use `ctxPoints` to define boundaries inside your repo that should get **their own** context outputs.

<div class="docs-panel">
<pre><code>export default {
  targets: ["agents-md", "claude", "cursor", "copilot", "llms"],
  ctxPoints: [
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
  <p>Default scanning is metadata-first and polyglot. It prioritizes manifests, config, docs, source boundaries, workflow files, infrastructure markers, Python files, .NET project files, and data workflow markers while excluding generated, dependency, cache, secret, and build-output paths.</p>
</div>

<div class="docs-panel">
<pre><code>export default {
  include: [
    "package.json",
    "pyproject.toml",
    "*.sln",
    "**/*.csproj",
    "src/**",
    "apps/**",
    "packages/**",
    "infra/**",
    ".github/workflows/**",
  ],
  exclude: [
    "node_modules/**",
    ".venv/**",
    "bin/**",
    "obj/**",
    ".terraform/**",
    "**/.env*",
  ],
}</code></pre>
</div>
