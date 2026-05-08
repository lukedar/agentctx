import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

export const typescriptPlugin: AgentCtxPlugin = {
  name: 'typescript',

  async detect(ctx): Promise<DetectionResult> {
    const detected = ctx.files.files.some((f) => f.path.endsWith('tsconfig.json'))
    return {
      detected,
      confidence: detected ? 0.9 : 0,
      reason: detected ? 'Detected tsconfig.json' : 'No tsconfig.json found',
    }
  },

  async extract(ctx): Promise<readonly Fact[]> {
    const sources = ctx.files.files
      .map((f) => f.path)
      .filter((p) => p.endsWith('tsconfig.json'))
      .sort((a, b) => a.localeCompare(b))

    return sources.map<Fact>((source) => ({
      kind: 'language',
      source,
      confidence: 0.85,
      data: { name: 'typescript' },
    }))
  },
}
