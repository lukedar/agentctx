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

export const packageDependenciesPlugin: AgentCtxPlugin = {
  name: 'package-dependencies',

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

    for (const packageJsonPath of listPackageJsonPaths(ctx)) {
      const pkg = await readPackageJsonSafe(ctx, packageJsonPath)
      if (!pkg) continue

      const packageName =
        typeof pkg.name === 'string' && pkg.name.trim() ? pkg.name.trim() : inferredName(packageJsonPath)

      const dependencyGroups = [
        ['dependencies', pkg.dependencies],
        ['devDependencies', pkg.devDependencies],
        ['peerDependencies', pkg.peerDependencies],
      ] as const

      for (const [dependencyType, deps] of dependencyGroups) {
        if (!deps) continue

        for (const [name, version] of Object.entries(deps).sort((a, b) => a[0].localeCompare(b[0]))) {
          facts.push({
            kind: 'dependency',
            source: packageJsonPath,
            confidence: 0.8,
            data: {
              packageName,
              packagePath: packageDir(packageJsonPath),
              name,
              version,
              dependencyType,
            },
          })
        }
      }
    }

    return facts
  },
}
