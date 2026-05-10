import type { AgentCtxConfig, CtxPointConfig } from '@agentctx/core'

type PointScope = Readonly<{ kind: 'point'; name: string; pointPath: string }>

export const normalizePointName = (name: string): string => name.replace(/[^a-zA-Z0-9_-]+/g, '-')

export const parsePointFlagList = (flags: { point?: unknown; points?: unknown }): readonly string[] => {
  const raw: string[] = []

  if (typeof flags.point === 'string' && flags.point.trim()) raw.push(flags.point.trim())
  if (typeof flags.points === 'string' && flags.points.trim()) {
    for (const p of flags.points.split(',').map((s) => s.trim()).filter(Boolean)) raw.push(p)
  }

  return raw
}

export const createPointConfig = (
  workspace: AgentCtxConfig,
  point: CtxPointConfig,
): AgentCtxConfig => {
  const pointPath = point.path.replace(/\\/g, '/').replace(/\/$/, '')
  const include = point.include ?? [
    'package.json',
    'pnpm-workspace.yaml',
    'pnpm-lock.yaml',
    'yarn.lock',
    'package-lock.json',
    `${pointPath}/package.json`,
    `${pointPath}/tsconfig.json`,
    `${pointPath}/**/package.json`,
    `${pointPath}/**/tsconfig.json`,
    `${pointPath}/.env.example`,
    `${pointPath}/**/.env.example`,
    `${pointPath}/**`,
  ]

  return {
    ...workspace,
    scope: {
      kind: 'point',
      name: normalizePointName(point.name),
      path: pointPath,
      ...(point.type ? { type: point.type } : {}),
      ...(point.frameworks ? { frameworks: point.frameworks } : {}),
      ...(point.dependsOn ? { dependsOn: point.dependsOn } : {}),
    },
    targets: point.targets ?? workspace.targets,
    include,
    exclude: [...workspace.exclude, ...(point.exclude ?? [])],
    budgets: {
      ...workspace.budgets,
      default: point.budget ?? workspace.budgets.default,
    },
    ctxPoints: [],
    contextFiles: {
      ...workspace.contextFiles,
      ...(point.contextFiles?.include ? { include: point.contextFiles.include } : {}),
      ...(point.contextFiles?.exclude ? { exclude: point.contextFiles.exclude } : {}),
      ...(point.contextFiles?.required ? { required: point.contextFiles.required } : {}),
    },
  }
}

export const selectContextPoints = (
  workspace: AgentCtxConfig,
  explicitPointNamesRaw: readonly string[],
): readonly CtxPointConfig[] => {
  const explicitPointNames = explicitPointNamesRaw.map((name) => normalizePointName(name).toLowerCase())

  return workspace.ctxPoints
    .map((p) => ({ ...p, name: normalizePointName(p.name) }))
    .filter((p) => (explicitPointNames.length > 0 ? explicitPointNames.includes(p.name.toLowerCase()) : true))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const resolvePointScope = (
  workspace: AgentCtxConfig,
  pointName: string,
): PointScope => {
  const normalizedName = normalizePointName(pointName).toLowerCase()
  const point = workspace.ctxPoints.find((p) => normalizePointName(p.name).toLowerCase() === normalizedName)
  if (!point) throw new Error(`Unknown CtxPoint: ${normalizePointName(pointName)}`)
  return { kind: 'point', name: normalizePointName(point.name), pointPath: point.path }
}

export const resolveSyncScopes = (
  workspace: AgentCtxConfig,
  explicitPointNamesRaw: readonly string[],
): readonly (Readonly<{ kind: 'workspace' }> | PointScope)[] => {
  const points = selectContextPoints(workspace, explicitPointNamesRaw)

  return [
    { kind: 'workspace' as const },
    ...points.map((point) => ({ kind: 'point' as const, name: point.name, pointPath: point.path })),
  ]
}
