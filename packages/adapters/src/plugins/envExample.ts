import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

const extractEnvVarNames = (text: string): readonly string[] => {
  const names = new Set<string>()

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const match = line.match(/^([A-Z][A-Z0-9_]+)\s*(=|$)/)
    if (match?.[1]) names.add(match[1])
  }

  return [...names].sort((a, b) => a.localeCompare(b))
}

export const envExamplePlugin: AgentCtxPlugin = {
  name: 'env-example',

  async detect(ctx): Promise<DetectionResult> {
    const detected =
      Boolean(ctx.files.byPath['.env.example']) || ctx.files.files.some((f) => f.path.endsWith('.env.example'))

    return {
      detected,
      confidence: detected ? 0.6 : 0,
      reason: detected ? 'Found .env.example' : 'No .env.example found',
    }
  },

  async extract(ctx: ScanContext): Promise<readonly Fact[]> {
    const envPaths = ctx.files.files
      .map((f) => f.path)
      .filter((p) => p.endsWith('.env.example'))
      .sort((a, b) => a.localeCompare(b))

    const facts: Fact[] = []

    for (const p of envPaths) {
      const text = await ctx.readText(p)
      const names = extractEnvVarNames(text)

      for (const name of names) {
        facts.push({
          kind: 'env-var',
          source: p,
          confidence: 0.75,
          data: { name },
        })
      }
    }

    return facts
  },
}
