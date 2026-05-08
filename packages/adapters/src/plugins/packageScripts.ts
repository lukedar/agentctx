import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

import { listPackageJsonPaths, readPackageJsonSafe } from '../utils/packageJson'

export const packageScriptsPlugin: AgentCtxPlugin = {
  name: 'package-scripts',

  async detect(ctx): Promise<DetectionResult> {
    const detected = listPackageJsonPaths(ctx).length > 0
    return {
      detected,
      confidence: detected ? 0.5 : 0,
      reason: detected ? 'Found package.json files' : 'No package.json in index',
    }
  },

  async extract(ctx: ScanContext): Promise<readonly Fact[]> {
    const facts: Fact[] = []

    for (const p of listPackageJsonPaths(ctx)) {
      const pkg = await readPackageJsonSafe(ctx, p)
      if (!pkg?.scripts) continue

      for (const [name, command] of Object.entries(pkg.scripts)) {
        if (!name.trim()) continue
        if (typeof command !== 'string' || !command.trim()) continue

        facts.push({
          kind: 'script',
          source: p,
          confidence: 0.6,
          data: {
            name: name.trim(),
            command: command.trim(),
          },
        })
      }
    }

    return facts
  },
}
