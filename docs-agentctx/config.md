# Configuration

<div class="docs-hero">
  <span class="docs-kicker">Runtime contract</span>
  <h1>Configure the compiler once then run <code>build</code>.</h1>
  <p class="docs-lead"><code>agentctx.config.ts</code> defines targets, scan rules, budgets, security defaults, and CtxPoint boundaries. Everything else is derived from that normalized config.</p>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Pipeline reference</h3>
  <p>Config is the first stage of the compiler. Use <a href="/pipeline">Pipeline</a> for the full execution order and terminology.</p>
</div>

## Minimal example

```ts
export default {
  targets: ["agents-md", "llms"],
}
```

## CtxPoints

Use `ctxPoints` to define boundaries inside your repo that should get **their own** context outputs.

```ts
export default {
  targets: ["agents-md", "llms"],
  ctxPoints: [
    {
      name: "api",
      path: "apps/api",
      exclude: ["apps/api/generated/**"],
      dependsOn: ["shared"],
    },
    {
      name: "shared",
      path: "packages/shared",
    },
  ],
}
```

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3><code>name</code></h3>
    <p>Identifier used by <code>--point</code> and sync/build selection.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3><code>path</code></h3>
    <p>Directory relative to the repo root.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3><code>targets</code></h3>
    <p>Choose the context surfaces the compiler should produce.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3><code>include</code> / <code>exclude</code></h3>
    <p>Control what the point scans inside its own boundary.</p>
  </div>
  <div class="docs-card docs-span-6">
    <h3><code>dependsOn</code></h3>
    <p>Express point-to-point dependencies for future affected workflows.</p>
  </div>
</div>

## Notes
<div class="docs-callout">
  <h3>Scanning rules</h3>
  <p>Default scanning is metadata-first and polyglot. It prioritizes manifests, config, docs, source boundaries, workflow files, infrastructure markers, Python files, .NET project files, and data workflow markers while excluding generated, dependency, cache, secret, and build-output paths.</p>
</div>
