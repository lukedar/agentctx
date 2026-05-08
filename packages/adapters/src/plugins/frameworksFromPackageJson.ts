import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

import { getAllDeps, listPackageJsonPaths, readPackageJsonSafe } from '../utils/packageJson'

const inferFrameworks = (deps: Record<string, string>): readonly string[] => {
  const out: string[] = []

  if (deps.next) out.push('next')
  if (deps.react) out.push('react')
  if (deps.vite) out.push('vite')
  if (deps['@angular/core']) out.push('angular')
  if (deps.express) out.push('express')
  if (deps.fastify) out.push('fastify')
  if (deps['@nestjs/core']) out.push('nestjs')
  if (deps.hono) out.push('hono')
  if (deps['@sveltejs/kit']) out.push('sveltekit')
  if (deps.nuxt) out.push('nuxt')
  if (deps.astro) out.push('astro')
  if (deps.remix) out.push('remix')

  return out
}

export const frameworksFromPackageJsonPlugin: AgentCtxPlugin = {
  name: 'frameworks-from-package-json',

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
      const frameworks = inferFrameworks(deps)

      for (const name of frameworks) {
        facts.push({
          kind: 'framework',
          source: p,
          confidence: 0.85,
          data: { name },
        })
      }
    }

    return facts
  },
}
