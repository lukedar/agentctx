import type { CAC } from 'cac'

import { explainContextFile } from '../lib/contextPlan'
import { log } from '../lib/logger'
import { resolveCwd } from '../lib/paths'

export const registerExplainCommand = (cli: CAC): void => {
  cli
    .command('explain', 'Explain why a v2 context file is or is not generated')
    .option('--cwd <dir>', 'Working directory')
    .option('--point <name>', 'Inspect a single CtxPoint')
    .option('--file <name>', 'Context file name, without .md')
    .option('--json', 'Machine-readable output')
    .action(async (flags: any) => {
      if (typeof flags.file !== 'string' || !flags.file.trim()) throw new Error('--file is required')

      const result = await explainContextFile({
        cwd: resolveCwd(flags.cwd),
        file: flags.file.trim(),
        ...(typeof flags.point === 'string' ? { point: flags.point } : {}),
      })

      if (flags.json) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({ ok: true, file: result }, null, 2))
        return
      }

      log(result.selected ? 'success' : 'info', `${result.name}.md ${result.selected ? 'is generated' : 'is skipped'}`)
      log('info', result.reason)
      log('info', `Category: ${result.category}; public safe: ${result.publicSafe ? 'yes' : 'no'}; max tokens: ${result.maxTokens}`)
    })
}
