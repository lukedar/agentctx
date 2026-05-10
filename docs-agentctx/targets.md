# Context Surfaces

<div class="docs-hero">
  <span class="docs-kicker">Delivery surfaces</span>
  <h1>Different systems should not receive the same context.</h1>
  <p class="docs-lead">
    AgentCtx renders selected context into visibility-aware surfaces for internal agents, public consumers, CI systems, review agents, and future autonomous engineering workflows.
  </p>
</div>

## Internal Agent Context

Internal surfaces can include local operational guidance, safety constraints, and repo-specific workflows.

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules/project.mdc`
- `.github/copilot-instructions.md`

## Public-Safe Context

Public-safe surfaces exclude sensitive context and are appropriate for external consumers.

- `llms.txt`
- future `llms-full.txt`
- future `public-manifest.json`

## Rule

Targets format selected context. They do not rescan the repo, reinterpret framework evidence, or bypass visibility policy.
