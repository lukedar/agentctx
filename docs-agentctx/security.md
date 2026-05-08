# Security

<div class="docs-hero">
  <span class="docs-kicker">Secure by default</span>
  <h1>Context generation should be useful without leaking secrets.</h1>
  <p class="docs-lead">AgentCtx ignores common secret files, redacts suspicious values, and only includes environment variable names.</p>
</div>

<div class="docs-grid">
  <div class="docs-card docs-span-4">
    <h3>Ignores</h3>
    <p><code>.env*</code>, keys, and common secret files are excluded from the scan.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Redaction</h3>
    <p>Suspicious token and key patterns are redacted before files are written.</p>
  </div>
  <div class="docs-card docs-span-4">
    <h3>Env values</h3>
    <p>Environment variable names are included; their values are not.</p>
  </div>
</div>

<div class="docs-callout" style="margin-top: 1rem;">
  <h3>Drift loop</h3>
  <p>If <code>agentctx check</code> reports staleness, run <code>agentctx build && agentctx sync</code>.</p>
</div>
