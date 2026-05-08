import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

export const workspacePlugin: AgentCtxPlugin = {
  name: 'workspace',

  async detect(ctx): Promise<DetectionResult> {
    const detected = Boolean(ctx.files.byPath['pnpm-workspace.yaml'])
    return {
      detected,
      confidence: detected ? 0.9 : 0,
      reason: detected ? 'Detected pnpm-workspace.yaml' : 'No workspace file found',
    }
  },

  async extract(ctx): Promise<readonly Fact[]> {
    if (!ctx.files.byPath['pnpm-workspace.yaml']) return []

    const fact: Fact = {
      kind: 'workspace',
      source: 'pnpm-workspace.yaml',
      confidence: 0.9,
      data: { tool: 'pnpm' },
    }

    return [fact]
  },
}
