import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

import { getAllDeps, listPackageJsonPaths, readPackageJsonSafe } from '../utils/packageJson'

const inferTestRunners = (deps: Record<string, string>): readonly string[] => {
  const out: string[] = []

  if (deps.vitest) out.push('vitest')
  if (deps.jest) out.push('jest')
  if (deps['@playwright/test']) out.push('playwright')
  if (deps.cypress) out.push('cypress')

  return out
}

export const testRunnersFromPackageJsonPlugin: AgentCtxPlugin = {
  name: 'test-runners-from-package-json',

  async detect(ctx): Promise<DetectionResult> {
    const detected = listPackageJsonPaths(ctx).length > 0
    return {
      detected,
      confidence: detected ? 0.7 : 0,
      reason: detected ? 'Found package.json files' : 'No package.json in index',
    }
  },

  async extract(ctx: ScanContext): Promise<readonly Fact[]> {
    const facts: Fact[] = []

    for (const p of listPackageJsonPaths(ctx)) {
      const pkg = await readPackageJsonSafe(ctx, p)
      if (!pkg) continue

      const deps = getAllDeps(pkg)
      const runners = inferTestRunners(deps)

      for (const name of runners) {
        facts.push({
          kind: 'test-runner',
          source: p,
          confidence: 0.85,
          data: { name },
        })
      }
    }

    return facts
  },
}
