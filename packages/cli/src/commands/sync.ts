import type { CAC } from 'cac'

import { loadConfig } from '@agentctx/core'

import { formatSyncJson } from '../lib/jsonOutput'
import { log } from '../lib/logger'
import { resolveCwd } from '../lib/paths'
import { parsePointFlagList, resolveSyncScopes } from '../lib/points'
import { runSync } from '../lib/sync/sync'

export const registerSyncCommand = (cli: CAC): void => {
  cli
    .command('sync', 'Sync built outputs into repo locations (preserving manual edits)')
    .option('--cwd <dir>', 'Working directory')
    .option('--targets <list>', 'Comma-separated target names')
    .option('--point <name>', 'Sync a single context point')
    .option('--points <list>', 'Comma-separated context point names')
    .option('--dry-run', 'Show what would change')
    .option('--check', 'Fail if outputs are stale')
    .option('--json', 'Machine-readable output')
    .action(async (flags: any) => {
      const cwd = resolveCwd(flags.cwd)
      const targets =
        typeof flags.targets === 'string'
          ? flags.targets
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : undefined

      const cfgRes = await loadConfig(cwd)
      if (!cfgRes.ok) throw new Error(cfgRes.error.message)
      const config = cfgRes.value

      const scopes = resolveSyncScopes(config, parsePointFlagList(flags))

      let aggregate = {
        filesChanged: 0,
        filesChecked: 0,
        ok: true,
        messages: [] as string[],
      }

      for (const scope of scopes) {
        const result = await runSync({
          cwd: config.rootDir,
          dryRun: Boolean(flags.dryRun),
          check: Boolean(flags.check),
          ...(targets === undefined ? {} : { targets }),
          scope,
        })

        aggregate.filesChanged += result.filesChanged
        aggregate.filesChecked += result.filesChecked
        aggregate.ok = aggregate.ok && result.ok

        const prefix = scope.kind === 'workspace' ? '[workspace]' : `[point:${scope.name}]`
        aggregate.messages.push(...result.messages.map((m) => `${prefix} ${m}`))
      }

      if (flags.json) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(formatSyncJson(aggregate), null, 2))
      } else {
        for (const m of aggregate.messages) log(aggregate.ok ? 'success' : 'warn', m)
        if (flags.check) {
          if (aggregate.ok) log('success', 'Sync check passed')
          else {
            log('error', 'Sync check failed')
            process.exitCode = 1
          }
        } else {
          log('success', `Synced (${aggregate.filesChanged} files updated)`) 
        }
      }

      if (flags.check && !aggregate.ok) process.exitCode = 1
    })
}
