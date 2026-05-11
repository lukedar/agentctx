# Framework Support

<div class="docs-hero">
  <span class="docs-kicker">Adapter model</span>
  <h1>Framework-specific understanding without framework-specific core logic.</h1>
  <p class="docs-lead">
    AgentCtx stays framework-agnostic by pushing detection into adapters. Adapters extract operational context as facts, evidence, confidence, and visibility signals.
  </p>
</div>

## Operational Context Extracted

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Frontend</h3>
    <p>Routes, guards, auth boundaries, component relationships, state, API clients, and styling surfaces.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Backend</h3>
    <p>Controllers, handlers, middleware, auth rules, validation, errors, and database boundaries.</p>
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

## Release Matrix

| Adapter | Priority | Status |
|---|---:|---|
| Node / TypeScript | Critical | Current |
| Angular | Critical | Current |
| .NET / ASP.NET Core | Critical | Current |
| React | High | Current |
| Next.js | High | Current |
| Shared Contracts | High | Current |
| Workers / Queues | High | Current |
| Infrastructure | Medium | Next |
| Kubernetes | Future | Planned |
| Terraform | Future | Planned |
| Python | Future | Planned |
| Java / Spring | Future | Planned |

## Operational Fact Taxonomy

Adapters emit operational facts using a shared taxonomy:

- responsibilities
- dependencies
- invariants
- failure modes
- risks
- execution paths
- runtime boundaries
- security boundaries
- task affordances
- safe commands

The compiler can then render the same facts into Context Blocks, Context Files, `AGENTS.md`, `llms.txt`, and future targets without framework-specific presentation logic.

## Compiler Performance

Adapter support is designed for compiler speed:

- file paths and basenames are precomputed once per scan
- text and JSON reads are cached within the build scope
- adapters reuse detection and extraction work when possible
- outputs stay sorted and deterministic

The adapter system should add framework understanding without turning every build into repeated filesystem scans.
