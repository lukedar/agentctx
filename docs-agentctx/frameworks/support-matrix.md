# Framework Support

<div class="docs-hero">
  <span class="docs-kicker">Adapter model</span>
  <h1>Framework-specific understanding without framework-specific core logic.</h1>
  <p class="docs-lead">
    AgentCtx stays framework-agnostic by pushing detection into adapters. Adapters emit facts, evidence, confidence, and visibility signals.
  </p>
</div>

## Supported Signals

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Frontend</h3>
    <p>React, Angular, Next, Vite, route files, components, state libraries, API clients, and styling surfaces.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Backend</h3>
    <p>Node APIs, .NET, route handlers, auth, validation, middleware, errors, and database markers.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Operations</h3>
    <p>GitHub Actions, Docker, infrastructure folders, deployment markers, CI, and environment surfaces.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Packages</h3>
    <p>Shared packages, contracts, schemas, public APIs, exports, and compatibility boundaries.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Workers</h3>
    <p>Workers, jobs, queues, scheduling, retries, and idempotency signals.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Data</h3>
    <p>Schema files, migrations, query layers, data-access boundaries, seed data, and quality surfaces.</p>
  </div>
</div>

## Adapter Contract

Adapters should not write docs. They should emit normalized facts that the compiler can use across every target.

This keeps AgentCtx extensible and future-proof as new frameworks and agent surfaces appear.
