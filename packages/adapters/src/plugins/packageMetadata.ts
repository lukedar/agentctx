import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

import { listPackageJsonPaths, readPackageJsonSafe } from '../utils/packageJson'

const packageDir = (packageJsonPath: string): string =>
  packageJsonPath.endsWith('/package.json')
    ? packageJsonPath.slice(0, -'/package.json'.length)
    : '.'

const inferredName = (packageJsonPath: string): string => {
  const dir = packageDir(packageJsonPath)
  if (dir === '.') return 'root'

  const parts = dir.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? dir
}

export const packageMetadataPlugin: AgentCtxPlugin = {
  name: 'package-metadata',

  async detect(ctx): Promise<DetectionResult> {
    const detected = listPackageJsonPaths(ctx).length > 0
    return {
      detected,
      confidence: detected ? 0.8 : 0,
      reason: detected ? 'Found package.json files' : 'No package.json in index',
    }
  },

  async extract(ctx: ScanContext): Promise<readonly Fact[]> {
    const facts: Fact[] = []

    for (const packageJsonPath of listPackageJsonPaths(ctx)) {
      const pkg = await readPackageJsonSafe(ctx, packageJsonPath)
      const pkgName = typeof pkg?.name === 'string' && pkg.name.trim() ? pkg.name.trim() : inferredName(packageJsonPath)

      facts.push({
        kind: 'package',
        source: packageJsonPath,
        confidence: 0.9,
        data: {
          name: pkgName,
          path: packageDir(packageJsonPath),
          private: pkg?.private === true,
        },
      })
    }

    return facts
  },
}
