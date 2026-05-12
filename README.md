# AgentCtx

AgentCtx generates operational context for coding agents so they can start, scope, validate, and complete repository changes with less rediscovery.

## Prototype

```bash
pnpm install
pnpm prototype:verify
pnpm --filter agentctx build
```

The CLI exposes:

- `agentctx init`
- `agentctx build`
- `agentctx check`
