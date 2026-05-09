import type { CAC } from 'cac'

import {
  createRepoFileIndex,
  extractFacts,
  loadConfig,
} from '@agentctx/core'
import { mvpPlugins } from '@agentctx/adapters'

import { readCachedFacts, hashConfig } from '../lib/cache/cache'
import { calculateDrift, type DriftReport } from '../lib/check/drift'
import { formatCheckJson, formatErrorJson } from '../lib/jsonOutput'
import { log } from '../lib/logger'
import { resolveCwd } from '../lib/paths'
import { createPointConfig, parsePointFlagList, selectContextPoints } from '../lib/points'
import { runSync } from '../lib/sync/sync'

type ScopeCheck = Readonly<{
  scopeKey: string
  drift?: DriftReport
  sync: Awaited<ReturnType<typeof runSync>>
  shouldFail: boolean
}>

export const registerCheckCommand = (cli: CAC): void => {
  cli
    .command('check', 'Validate drift and stale synced outputs')
    .option('--cwd <dir>', 'Working directory')
    .option('--point <name>', 'Check a single CtxPoint')
    .option('--points <list>', 'Comma-separated CtxPoint names')
    .option('--json', 'Machine-readable output')
    .action(async (flags: any) => {
      const cwd = resolveCwd(flags.cwd)

      const cfgRes = await loadConfig(cwd)
      if (!cfgRes.ok) {
        if (flags.json) {
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(formatErrorJson(cfgRes.error), null, 2))
        } else {
          log('error', cfgRes.error.message)
        }
        process.exitCode = 1
        return
      }

      const config = cfgRes.value
      const configHash = hashConfig(config)

      const pointsToCheck = selectContextPoints(config, parsePointFlagList(flags))

      const checks: ScopeCheck[] = []

      // Workspace
      {
        const cached = await readCachedFacts(config.rootDir, 'workspace')
        if (!cached || cached.configHash !== configHash) {
          if (!flags.json) log('warn', 'No cached workspace facts found for this config; run agentctx build')
        }

        const indexRes = await createRepoFileIndex(config)
        if (!indexRes.ok) throw new Error(indexRes.error.message)
        const factsRes = await extractFacts({ config, files: indexRes.value, plugins: mvpPlugins })
        if (!factsRes.ok) throw new Error(factsRes.error.message)

        const drift = cached ? calculateDrift(cached.facts, factsRes.value) : undefined
        const sync = await runSync({ cwd: config.rootDir, check: true, scope: { kind: 'workspace' } })

        const shouldFail =
          Boolean(config.drift.failOnCheck) &&
          typeof drift?.percent === 'number' &&
          drift.percent >= config.drift.thresholdPercent

        checks.push({
          scopeKey: 'workspace',
          ...(drift === undefined ? {} : { drift }),
          sync,
          shouldFail,
        })
      }

      // Points
      for (const p of pointsToCheck) {
        const scopeKey = `points/${p.name}`
        const pointConfig = createPointConfig(config, p)
        const pointConfigHash = hashConfig(pointConfig)

        const cached = await readCachedFacts(config.rootDir, scopeKey)
        if (!cached || cached.configHash !== pointConfigHash) {
          if (!flags.json) log('warn', `No cached facts for point ${p.name}; run agentctx build --point ${p.name}`)
        }

        const indexRes = await createRepoFileIndex(pointConfig)
        if (!indexRes.ok) throw new Error(indexRes.error.message)
        const factsRes = await extractFacts({ config: pointConfig, files: indexRes.value, plugins: mvpPlugins })
        if (!factsRes.ok) throw new Error(factsRes.error.message)

        const drift = cached ? calculateDrift(cached.facts, factsRes.value) : undefined
        const sync = await runSync({
          cwd: config.rootDir,
          check: true,
          scope: { kind: 'point', name: p.name, pointPath: p.path },
        })

        const shouldFail =
          Boolean(config.drift.failOnCheck) &&
          typeof drift?.percent === 'number' &&
          drift.percent >= config.drift.thresholdPercent

        checks.push({
          scopeKey,
          ...(drift === undefined ? {} : { drift }),
          sync,
          shouldFail,
        })
      }

      const ok = checks.every((c) => c.sync.ok && !c.shouldFail)

      if (flags.json) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(formatCheckJson({
          ok,
          thresholdPercent: config.drift.thresholdPercent,
          checks,
        }), null, 2))
      } else {
        for (const c of checks) {
          const label = c.scopeKey === 'workspace' ? 'workspace' : c.scopeKey

          if (c.drift) {
            const driftLabel = `Drift (${label}): ${c.drift.percent}%`
            if (c.drift.percent >= config.drift.thresholdPercent) log('warn', driftLabel)
            else log('success', driftLabel)
          }

          if (c.sync.ok) log('success', `Synced (${label})`)
          else {
            log('warn', `Stale outputs (${label})`)
            for (const m of c.sync.messages) log('warn', m)
          }

          if (c.shouldFail) log('error', `Drift threshold exceeded (${label})`)
        }
      }

      if (!ok) process.exitCode = 1
    })
}
