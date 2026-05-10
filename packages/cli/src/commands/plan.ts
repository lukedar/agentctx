import type { CAC } from 'cac'

import { createContextFilePlanItems } from '../lib/contextPlan'
import { log } from '../lib/logger'
import { resolveCwd } from '../lib/paths'

export const registerPlanCommand = (cli: CAC): void => {
  cli
    .command('plan', 'Inspect the context-file generation plan')
    .option('--cwd <dir>', 'Working directory')
    .option('--point <name>', 'Inspect a single CtxPoint')
    .option('--json', 'Machine-readable output')
    .action(async (flags: any) => {
      const result = await createContextFilePlanItems({
        cwd: resolveCwd(flags.cwd),
        ...(typeof flags.point === 'string' ? { point: flags.point } : {}),
      })

      if (flags.json) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({
          ok: true,
          point: result.point ?? 'workspace',
          capabilities: result.capabilities,
          files: result.files,
        }, null, 2))
        return
      }

      log('info', `Context files for ${result.point ?? 'workspace'}`)
      const selected = result.files.filter((file) => file.selected)
      const skipped = result.files.filter((file) => !file.selected)

      for (const file of selected) log('success', `${file.name}.md (${file.category}) - ${file.reason}`)
      if (skipped.length > 0) {
        log('info', 'Skipped')
        for (const file of skipped.slice(0, 12)) log('info', `${file.name}.md - ${file.reason}`)
      }
    })
}
