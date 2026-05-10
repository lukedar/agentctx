# AgentCtx V2 Framework Deployment Plan
## Docs, CLI Distribution, Release Channels, and Adoption UX

## Purpose

Add deployment and distribution to the AgentCtx V2 plan as a first-class product workstream.

AgentCtx V2 is not just a compiler. It must be easy to discover, install, evaluate, and adopt.

The deployment strategy must cover:

- public docs site
- CLI install/download UX
- npm package distribution
- release channels
- framework adapter versioning
- docs versioning
- benchmark proof pages
- public examples
- launch readiness

The target user should be able to:

```bash
pnpm dlx agentctx init
```

and understand the value of AgentCtx within 30 seconds.

---

# Core Deployment Principle

The docs site is part of the product.

AgentCtx is infrastructure, so adoption depends on trust, clarity, and strong developer experience.

The first public impression must communicate:

```text
Any team. Any framework. Any repo.
Context infrastructure for autonomous software engineering systems.
```

---

# Recommended Initial Hosting

## Use VitePress + GitHub Pages + GitHub Actions

GitHub Pages can turn a repository into a live website without separate hosting, and it supports custom domains later. VitePress has official deployment guidance for GitHub Pages using GitHub Actions. This is the simplest free starting point for an open-source CLI framework. 

Sources:
- GitHub Pages: https://pages.github.com/
- VitePress deployment guide: https://vitepress.dev/guide/deploy

Expected public URL:

```text
https://<github-org>.github.io/<repo-name>/
```

Example:

```text
https://agentctx.github.io/agentctx/
```

---

# Future Hosting Option

## Cloudflare Pages

Cloudflare Pages is a strong later option because it provides Git integration, edge delivery, collaboration features, and automatic deployment from GitHub/GitLab pushes.

Sources:
- Cloudflare Pages: https://pages.cloudflare.com/
- Cloudflare Pages Git integration: https://developers.cloudflare.com/pages/configuration/git-integration/

Use Cloudflare Pages later if you want:

- custom domain
- faster global edge delivery
- preview deployments
- Workers integration
- stronger production docs hosting

Initial recommendation:

```text
Start with GitHub Pages.
Move to Cloudflare Pages when the project needs stronger deployment workflows.
```

---

# CLI Distribution Strategy

## Primary npm package

Initial public package:

```text
agentctx
```

Install commands:

```bash
npm install -D agentctx
pnpm add -D agentctx
yarn add -D agentctx
```

One-shot usage:

```bash
npx agentctx init
pnpm dlx agentctx init
```

Recommended homepage CTA:

```bash
pnpm dlx agentctx init
```

---

# Release Channels

Use npm dist-tags for release channels.

npm distribution tags allow users to install a package by tag rather than exact version, and npm supports publishing with a non-default tag using `npm publish --tag <tag>`.

Sources:
- npm dist-tags: https://docs.npmjs.com/cli/v8/commands/npm-dist-tag/
- npm publish with dist-tag: https://docs.npmjs.com/adding-dist-tags-to-packages/

Recommended channels:

```text
latest       stable public release
next         upcoming V2 preview
experimental unstable features
legacy       V1 compatibility package if needed
```

Example commands:

```bash
npm publish --tag next
npm publish --tag latest
```

Install examples:

```bash
npm install -D agentctx@latest
npm install -D agentctx@next
pnpm dlx agentctx@next init
```

---

# Package Versioning

Use semantic versioning.

Recommended meaning:

```text
1.x = V1 legacy prototype
2.0 = semantic context compiler
2.x = stable V2 feature releases
next = upcoming features
experimental = unstable research features
```

Docs should clearly label:

```text
Stable
Preview
Experimental
Legacy
```

---

# Framework Adapter Distribution

Start monolithic for simplicity, but design for modular adapters.

## Initial package

```text
agentctx
```

Includes:

- CLI
- core compiler
- base renderers
- initial adapters
- docs links
- bench MVP

## Future packages

```text
@agentctx/core
@agentctx/cli
@agentctx/adapter-angular
@agentctx/adapter-dotnet
@agentctx/adapter-node
@agentctx/adapter-react
@agentctx/adapter-next
@agentctx/bench
@agentctx/bench-adapter-angular
@agentctx/bench-adapter-dotnet
```

Do not split packages too early unless package size, adapter complexity, or release cadence requires it.

---

# Adapter Compatibility Metadata

Every adapter should expose metadata.

```ts
export const angularAdapter = defineFrameworkAdapter({
  name: "angular",
  version: "0.1.0",
  status: "preview",
  supportedFrameworkVersions: [">=16"],
  capabilities: [
    "frontend",
    "routing",
    "components",
    "testing",
    "commands"
  ]
})
```

Docs should automatically or manually render this into:

```text
Framework support matrix
Adapter pages
Release notes
CLI diagnostics
```

---

# Docs Deployment Pipeline

## Required scripts

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "docs:check": "pnpm docs:build"
  }
}
```

## GitHub Actions workflow

Create:

```text
.github/workflows/docs.yml
```

Workflow:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths:
      - "docs/**"
      - "package.json"
      - "pnpm-lock.yaml"
      - ".github/workflows/docs.yml"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: docs
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm docs:build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

# Docs Site UX

## Top-level navigation

```text
Why AgentCtx
Architecture
Frameworks
Bench
CLI
Docs
GitHub
```

## Homepage hero

```text
Context infrastructure for autonomous software engineering systems.
```

## Homepage subheading

```text
Compile any repo into structured, secure, token-efficient operational context for coding agents, CI agents, review agents, docs crawlers, and future autonomous engineering workflows.
```

## Primary CTA

```bash
pnpm dlx agentctx init
```

## Secondary CTA

```text
Read Why AgentCtx
View Benchmarks
Explore Frameworks
```

---

# Install and Download Pages

Add:

```text
docs/getting-started/install.md
docs/getting-started/quickstart.md
docs/releases/latest.md
docs/releases/channels.md
```

## Install page must include

```bash
npm install -D agentctx
pnpm add -D agentctx
yarn add -D agentctx
npx agentctx init
pnpm dlx agentctx init
```

## Quickstart page must include

```bash
pnpm dlx agentctx init
pnpm agentctx build
pnpm agentctx check
```

Expected output:

```text
✔ Detected monorepo
✔ Detected Angular frontend
✔ Detected .NET API
✔ Generated AGENTS.md
✔ Generated llms.txt
✔ Generated context manifest
✔ Estimated token reduction: 72%
```

---

# Framework-Specific Quickstarts

Add quickstarts for:

```text
Angular
.NET
Node
React
Next.js
Polyglot monorepo
```

Each page should show:

- install command
- init command
- expected detection output
- generated context files
- benchmark example
- adapter status
- limitations

Example:

```text
docs/frameworks/angular/quickstart.md
docs/frameworks/dotnet/quickstart.md
```

---

# Framework Support Matrix

Create:

```text
docs/frameworks/support-matrix.md
```

Example:

```md
| Framework | Detection | Context Slices | Bench Adapter | Status |
|---|---:|---:|---:|---|
| Angular | Yes | Routes, Components, State | Yes | Preview |
| .NET | Yes | API, Auth, Database | Yes | Preview |
| Node | Yes | API, Commands, Workers | Partial | Preview |
| React | Yes | Components, State | Planned | Planned |
| Next.js | Yes | Routes, API, Server/Client | Planned | Planned |
```

---

# Benchmark Storytelling

Create a dedicated benchmark landing page:

```text
docs/bench/overview.md
```

Positioning:

```text
AgentCtx Bench proves whether structured context improves agent outcomes.
```

Show:

```text
No Context vs AgentCtx Context
```

Metrics:

- task success
- token usage
- runtime
- security findings
- file accuracy
- irrelevant edits

Example section:

```text
AgentCtx Context vs No Context

Success: +40%
Token usage: -52%
Runtime: -31%
Security findings: -100%
Irrelevant file edits: -75%
```

Every benchmark claim must link to:

- methodology
- fixture
- raw report
- limitations

---

# Public Examples

Add:

```text
examples/
  angular-dotnet-monorepo/
  node-worker-system/
  generated-context/
  benchmark-reports/
```

Docs should link to:

```text
Example repo
Generated AGENTS.md
Generated llms.txt
Generated public-manifest.json
Benchmark report
```

This improves trust and adoption.

---

# Downloadable Assets

Create downloadable examples in docs:

```text
generated-context.zip
benchmark-report.html
sample-agentctx-config.ts
```

These are useful for CTOs and dev teams who want to inspect outputs before installing.

---

# Public Release Checklist

Before public release:

```text
npm package exists
pnpm dlx agentctx init works
docs deploy successfully
README links to docs
install page exists
quickstart works
framework support matrix exists
benchmark page exists
public examples exist
release notes exist
V1 is labelled legacy
V2 is labelled current/preview as appropriate
```

---

# Development Batches to Add to V2 Plan

## Batch A: Docs Deployment Foundation

1. Add VitePress.
2. Add docs scripts.
3. Add GitHub Pages workflow.
4. Add docs build check.
5. Add initial public homepage.

Expected outcome:

```text
Docs can be deployed to a free public URL.
```

## Batch B: CLI Install UX

1. Add install page.
2. Add quickstart page.
3. Add homepage install CTA.
4. Add package README install section.
5. Add install smoke test.

Expected outcome:

```text
Users can install and run AgentCtx in under 30 seconds.
```

## Batch C: Release Channels

1. Define npm `latest`, `next`, `experimental`, `legacy`.
2. Add release docs.
3. Add changelog structure.
4. Add version badges.
5. Add release checklist.

Expected outcome:

```text
Users understand which version to install.
```

## Batch D: Framework Distribution Docs

1. Add support matrix.
2. Add Angular quickstart.
3. Add .NET quickstart.
4. Add Node quickstart.
5. Add adapter metadata format.

Expected outcome:

```text
Teams understand how AgentCtx applies to their stack.
```

## Batch E: Benchmark Proof Pages

1. Add benchmark landing page.
2. Add methodology.
3. Add sample reports.
4. Add raw data links.
5. Add limitations page.

Expected outcome:

```text
AgentCtx can make evidence-backed value claims.
```

## Batch F: Launch Readiness

1. Add public examples.
2. Add downloadable sample outputs.
3. Add launch README.
4. Add docs link checker.
5. Add public release smoke test.

Expected outcome:

```text
AgentCtx is ready to share publicly.
```

---

# Agent 2 Review Criteria for Deployment

Agent 2 must check:

```text
Does the docs site deploy?
Does the install command work?
Does pnpm dlx agentctx init work?
Are docs consistent with V2 positioning?
Are framework statuses accurate?
Are benchmark claims supported?
Are release channels clear?
Are public examples safe?
Are no secrets or private data included?
Is the first-run experience impressive?
```

Minimum release gate:

```text
docs quality >= 9
install UX >= 9
security >= 9
distribution readiness >= 9
```

---

# Final Recommendation

Add deployment and distribution as a first-class V2 workstream.

Use:

```text
VitePress + GitHub Pages
```

for the initial docs site.

Use:

```text
npm latest / next / experimental
```

for release channels.

Make the public docs site sell and prove the idea:

```text
Any team. Any framework. Any repo.
Context infrastructure for autonomous software engineering systems.
```

The first user experience should be:

```bash
pnpm dlx agentctx init
```

followed by an impressive, clear, benchmark-backed explanation of why structured context matters.
