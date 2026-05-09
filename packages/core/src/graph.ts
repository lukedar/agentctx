import path from 'node:path'

import type { AgentCtxConfig, AppNode, CtxGraph, Fact, PackageNode, Relationship } from './types'

const packageId = (pkgPath: string, pkgName?: string): string => pkgName && pkgName.trim() ? pkgName.trim() : pkgPath

const packageNameFromPath = (pkgPath: string): string => {
  if (pkgPath === '.' || pkgPath === '') return 'root'
  return path.posix.basename(pkgPath)
}

const isPackageFact = (fact: Fact): boolean => fact.kind === 'package'

const isInPointScope = (pkgPath: string, pointPath: string): boolean =>
  pkgPath === pointPath || pkgPath.startsWith(`${pointPath}/`)

const isGeneratedPackagePath = (pkgPath: string): boolean => {
  const normalized = pkgPath.replace(/\\/g, '/')
  return (
    normalized === '.agentctx' ||
    normalized.includes('/.agentctx/') ||
    normalized === 'node_modules' ||
    normalized.includes('/node_modules/') ||
    normalized === 'dist' ||
    normalized.includes('/dist/') ||
    normalized === 'build' ||
    normalized.includes('/build/') ||
    normalized === 'dist-server' ||
    normalized.includes('/dist-server/') ||
    normalized === 'coverage' ||
    normalized.includes('/coverage/') ||
    normalized === '.next' ||
    normalized.includes('/.next/') ||
    normalized === '.vitepress/cache' ||
    normalized.includes('/.vitepress/cache/') ||
    normalized === '.vitepress/dist' ||
    normalized.includes('/.vitepress/dist/')
  )
}

export const buildGraph = (facts: readonly Fact[], config: AgentCtxConfig): CtxGraph => {
  const pointPath = config.scope?.kind === 'point' ? config.scope.path.replace(/\/$/, '') : undefined

  const packageFacts = facts
    .filter(isPackageFact)
    .map((fact) => {
      const pkgPath = typeof fact.data.path === 'string' && fact.data.path.trim()
        ? fact.data.path.trim()
        : '.'
      const pkgName = typeof fact.data.name === 'string' && fact.data.name.trim()
        ? fact.data.name.trim()
        : packageNameFromPath(pkgPath)

      return {
        id: packageId(pkgPath, pkgName),
        path: pkgPath,
        name: pkgName,
      }
    })
    .filter((pkg) => !isGeneratedPackagePath(pkg.path))
    .filter((pkg) => (pointPath ? isInPointScope(pkg.path, pointPath) : true))
    .sort((a, b) => a.path.localeCompare(b.path))

  const apps: AppNode[] = packageFacts
    .filter((pkg) => pkg.path === 'apps' || pkg.path.startsWith('apps/'))
    .map((pkg) => ({
      id: pkg.id,
      path: pkg.path,
      name: pkg.name,
      kind: 'app',
    }))

  const packages: PackageNode[] = packageFacts
    .filter((pkg) => !(pkg.path === 'apps' || pkg.path.startsWith('apps/')))
    .map((pkg) => ({
      id: pkg.id,
      path: pkg.path,
      name: pkg.name,
      kind: 'package',
    }))

  const knownPackagesByName = new Map(packageFacts.map((pkg) => [pkg.name, pkg]))

  const relationships: Relationship[] = facts
    .filter((fact) => fact.kind === 'dependency')
    .flatMap((fact) => {
      const fromName = typeof fact.data.packageName === 'string' ? fact.data.packageName : undefined
      const depName = typeof fact.data.name === 'string' ? fact.data.name : undefined
      if (!fromName || !depName) return []

      const fromPackage = knownPackagesByName.get(fromName)
      const toPackage = knownPackagesByName.get(depName)
      if (!fromPackage || !toPackage || fromPackage.id === toPackage.id) return []

      return [{
        from: fromPackage.id,
        to: toPackage.id,
        type: 'depends-on' as const,
      }]
    })
    .sort((a, b) => {
      const fromCmp = a.from.localeCompare(b.from)
      if (fromCmp !== 0) return fromCmp
      const toCmp = a.to.localeCompare(b.to)
      if (toCmp !== 0) return toCmp
      return a.type.localeCompare(b.type)
    })
    .filter((relationship, index, all) =>
      index === 0 ||
      relationship.from !== all[index - 1]?.from ||
      relationship.to !== all[index - 1]?.to ||
      relationship.type !== all[index - 1]?.type,
    )

  return {
    rootDir: config.rootDir,
    facts: [...facts],
    apps,
    packages,
    relationships,
    ctxBlocks: {},
  }
}
