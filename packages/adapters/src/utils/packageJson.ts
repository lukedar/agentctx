import type { ScanContext } from '@agentctx/core'

export type PackageJson = {
  name?: string
  private?: boolean
  workspaces?: unknown
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  scripts?: Record<string, string>
  engines?: Record<string, string>
}

export const listPackageJsonPaths = (ctx: ScanContext): readonly string[] =>
  (ctx.paths ?? ctx.files.files.map((f) => f.path))
    .filter((p) => p.endsWith('package.json'))
    .sort((a, b) => a.localeCompare(b))

export const readPackageJsonSafe = async (ctx: ScanContext, p: string): Promise<PackageJson | undefined> => {
  try {
    return await ctx.readJson<PackageJson>(p)
  } catch {
    return undefined
  }
}

export const getAllDeps = (pkg: PackageJson): Record<string, string> => ({
  ...(pkg.dependencies ?? {}),
  ...(pkg.devDependencies ?? {}),
  ...(pkg.peerDependencies ?? {}),
})
