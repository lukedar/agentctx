# Public-Safe Context

<div class="docs-hero">
  <span class="docs-kicker">Security model</span>
  <h1>Public outputs. Public safe.</h1>
  <p class="docs-lead">
    AgentCtx separates internal agent context from public-safe context so broad outputs like <code>llms.txt</code> do not expose local security, secret, permission, ownership, or release detail.
  </p>
</div>

## Visibility Classes

- `public`: safe for external consumers and docs crawlers
- `internal`: safe for local agents working inside the repo
- `sensitive`: local-only operational guidance that should not be published
- `secret`: never emitted as values

## Rules

- Secret values are never emitted.
- Environment variables appear as names only.
- `.env*`, keys, certificates, build output, dependency folders, and common generated directories are excluded by default.
- `security.md`, `secrets.md`, `permissions.md`, `ownership.md`, and release-sensitive files are local/internal by default.
- `llms.txt` links only to public-safe context files.

## Local files still matter

Internal files are still generated because they are useful to coding agents working inside the repo. The difference is distribution: local agents can load security and boundary guidance, while public index outputs stay safe to share.
