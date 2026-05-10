import type { CAC } from 'cac'

import { runBuild } from '../lib/build/build'
import { formatBuildJson } from '../lib/jsonOutput'
import { parseContextFileCategories, parseContextFileNames } from '../lib/contextFiles'
import { log } from '../lib/logger'
import { resolveCwd } from '../lib/paths'
import { parsePointFlagList } from '../lib/points'
import { parseTargetNames } from '../lib/targets'

export const registerBuildCommand = (cli: CAC): void => {
  cli
    .command('build', 'Compile repo facts into agent-ready context outputs')
    .option('--cwd <dir>', 'Working directory')
    .option('--changed', 'Use cache and skip rebuild if no files changed')
    .option('--dry-run', 'Compute without writing files')
    .option('--json', 'Machine-readable output')
    .option('--targets <list>', 'Comma-separated target names')
    .option('--point <name>', 'Build a single CtxPoint (plus workspace)')
    .option('--points <list>', 'Comma-separated CtxPoint names (plus workspace)')
    .option('--category <list>', 'Comma-separated context file categories')
    .option('--file <list>', 'Comma-separated context file names')
    .action(async (flags: any) => {
      const cwd = resolveCwd(flags.cwd)
      const targets = parseTargetNames(flags.targets)
      const categories = parseContextFileCategories(flags.category)
      const files = parseContextFileNames(flags.file)

      const pointsRaw = parsePointFlagList(flags)
      const points = pointsRaw.length > 0 ? pointsRaw : undefined

      const result = await runBuild({
        cwd,
        changed: Boolean(flags.changed),
        dryRun: Boolean(flags.dryRun),
        ...(targets === undefined ? {} : { targets }),
        ...(points === undefined ? {} : { points }),
        ...(categories === undefined ? {} : { categories }),
        ...(files === undefined ? {} : { files }),
      })

      if (flags.json) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(formatBuildJson(result), null, 2))
        return
      }

      log('success', `Built context (wrote ${result.filesWritten} files) in ${result.durationMs}ms`)
      log('info', `Compiled token estimate: ~${result.tokenEstimate.compiled}`)
      if (result.points.length > 0) log('info', `Built ${result.points.length} CtxPoint(s)`)
    })
}
