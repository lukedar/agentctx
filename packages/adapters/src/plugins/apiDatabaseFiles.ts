import path from 'node:path'

import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

const isApiSpec = (p: string, base: string): string | undefined => {
  if (base === 'openapi.yaml' || base === 'openapi.yml' || base === 'openapi.json') return 'openapi'
  if (base === 'swagger.json' || base === 'swagger.yaml' || base === 'swagger.yml') return 'swagger'
  if (base === 'schema.graphql' || base === 'schema.gql') return 'graphql'
  if (base.endsWith('.proto')) return 'protobuf'
  if (base === 'asyncapi.yaml' || base === 'asyncapi.yml' || base === 'asyncapi.json') return 'asyncapi'
  if (p.endsWith('/graphql/schema.graphql')) return 'graphql'
  return undefined
}

const isDbSpec = (p: string, base: string): string | undefined => {
  if (base === 'schema.prisma') return 'prisma'
  if (base === 'drizzle.config.ts' || base === 'drizzle.config.js') return 'drizzle'
  if (base === 'knexfile.js' || base === 'knexfile.ts') return 'knex'
  if (base === 'flyway.conf') return 'flyway'
  if (p.includes('/migrations/') && (base.endsWith('.sql') || base.endsWith('.ts') || base.endsWith('.js'))) return 'migrations'
  return undefined
}

export const apiDatabaseFilesPlugin: AgentCtxPlugin = {
  name: 'api-database-files',

  async detect(ctx): Promise<DetectionResult> {
    const detected = ctx.files.files.some((f) => {
      const base = path.posix.basename(f.path)
      return Boolean(isApiSpec(f.path, base) || isDbSpec(f.path, base))
    })

    return {
      detected,
      confidence: detected ? 0.5 : 0,
      reason: detected ? 'Found API/database spec files' : 'No API/database spec files found',
    }
  },

  async extract(ctx: ScanContext): Promise<readonly Fact[]> {
    const facts: Fact[] = []

    for (const f of ctx.files.files) {
      const p = f.path
      const base = path.posix.basename(p)

      const api = isApiSpec(p, base)
      if (api) {
        facts.push({
          kind: 'api',
          source: p,
          confidence: 0.7,
          data: { name: api, path: p },
        })
      }

      const db = isDbSpec(p, base)
      if (db) {
        facts.push({
          kind: 'database',
          source: p,
          confidence: 0.7,
          data: { name: db, path: p },
        })
      }
    }

    return facts
  },
}
