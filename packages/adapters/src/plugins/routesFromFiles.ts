import path from 'node:path'

import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

const isRouteModule = (base: string): boolean =>
  base.endsWith('.ts') ||
  base.endsWith('.tsx') ||
  base.endsWith('.js') ||
  base.endsWith('.jsx') ||
  base.endsWith('.mjs') ||
  base.endsWith('.cjs')

const routeToPath = (routePath: string, base: string): string => {
  const stripped = routePath
    .replace(/\/route\.(t|j)sx?$/, '')
    .replace(/\/index\.(t|j)sx?$/, '')
    .replace(/\.(t|j)sx?$/, '')
    .replace(/\.(m|c)js$/, '')
  const cleaned = stripped
    .split('/')
    .filter(Boolean)
    .join('/')

  if (!cleaned) {
    if (base === 'route.ts' || base === 'route.js' || base.startsWith('index.')) return '/'
    return `/${base.replace(/\.(t|j)sx?$/, '').replace(/\.(m|c)js$/, '')}`
  }

  return `/${cleaned}`
}

const classifyRoute = (filePath: string): Readonly<{ kind: string; route: string }> | undefined => {
  const normalized = filePath.replace(/\\/g, '/')
  const base = path.posix.basename(normalized)

  if (normalized.startsWith('pages/api/') || normalized.includes('/pages/api/')) {
    const route = normalized.includes('/pages/api/')
      ? (normalized.split('/pages/api/')[1] ?? '')
      : normalized.slice('pages/api/'.length)
    return { kind: 'next-pages-api', route: routeToPath(route, base) }
  }

  if ((normalized.startsWith('app/api/') || normalized.includes('/app/api/')) && (base === 'route.ts' || base === 'route.js')) {
    const route = normalized.includes('/app/api/')
      ? (normalized.split('/app/api/')[1] ?? '')
      : normalized.slice('app/api/'.length)
    return { kind: 'next-app-api', route: routeToPath(route, base) }
  }

  if (
    normalized.startsWith('src/routes/') ||
    normalized.includes('/src/routes/') ||
    normalized.startsWith('routes/') ||
    normalized.includes('/routes/')
  ) {
    const marker = normalized.startsWith('src/routes/')
      ? 'src/routes/'
      : normalized.includes('/src/routes/')
        ? '/src/routes/'
        : normalized.startsWith('routes/')
          ? 'routes/'
          : '/routes/'
    const route = normalized.split(marker)[1] ?? ''
    if (isRouteModule(base)) return { kind: 'filesystem-route', route: routeToPath(route, base) }
  }

  if ((normalized.startsWith('api/') || normalized.includes('/api/')) && isRouteModule(base)) {
    const route = normalized.includes('/api/')
      ? (normalized.split('/api/')[1] ?? '')
      : normalized.slice('api/'.length)
    return { kind: 'api-module', route: routeToPath(route, base) }
  }

  return undefined
}

export const routesFromFilesPlugin: AgentCtxPlugin = {
  name: 'routes-from-files',

  async detect(ctx): Promise<DetectionResult> {
    const detected = ctx.files.files.some((file) => classifyRoute(file.path) !== undefined)
    return {
      detected,
      confidence: detected ? 0.6 : 0,
      reason: detected ? 'Found route-like files' : 'No route-like files found',
    }
  },

  async extract(ctx: ScanContext): Promise<readonly Fact[]> {
    const facts: Fact[] = []

    for (const file of ctx.files.files) {
      const classified = classifyRoute(file.path)
      if (!classified) continue

      facts.push({
        kind: 'route',
        source: file.path,
        confidence: 0.75,
        data: {
          kind: classified.kind,
          path: classified.route,
          file: file.path,
        },
      })
    }

    return facts
  },
}
