import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

const hasAny = (ctx: ScanContext, fileName: string): string | undefined => {
  const match = ctx.files.files.map((f) => f.path).find((p) => p === fileName || p.endsWith(`/${fileName}`))
  return match
}

export const packageManagerPlugin: AgentCtxPlugin = {
  name: 'package-manager',

  async detect(ctx): Promise<DetectionResult> {
    const detected =
      Boolean(hasAny(ctx, 'pnpm-lock.yaml')) || Boolean(hasAny(ctx, 'yarn.lock')) || Boolean(hasAny(ctx, 'package-lock.json'))

    return {
      detected,
      confidence: detected ? 0.9 : 0,
      reason: detected ? 'Detected lockfile' : 'No lockfile found in index',
    }
  },

  async extract(ctx): Promise<readonly Fact[]> {
    const facts: Fact[] = []

    const pnpmLock = hasAny(ctx, 'pnpm-lock.yaml')
    const yarnLock = hasAny(ctx, 'yarn.lock')
    const npmLock = hasAny(ctx, 'package-lock.json')

    if (pnpmLock) {
      facts.push({
        kind: 'package-manager',
        source: pnpmLock,
        confidence: 0.95,
        data: { name: 'pnpm' },
      })
    } else if (yarnLock) {
      facts.push({
        kind: 'package-manager',
        source: yarnLock,
        confidence: 0.95,
        data: { name: 'yarn' },
      })
    } else if (npmLock) {
      facts.push({
        kind: 'package-manager',
        source: npmLock,
        confidence: 0.95,
        data: { name: 'npm' },
      })
    }

    return facts
  },
}
