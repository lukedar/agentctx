import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { CAC } from 'cac'

import { log } from '../lib/logger'
import { resolveCwd } from '../lib/paths'

const defaultConfigTemplate = `export default {
  targets: ["agents-md", "claude", "cursor", "copilot", "llms"],
}
`

export const registerInitCommand = (cli: CAC): void => {
  cli
    .command('init', 'Initialize AgentCtx in the current repository')
    .option('--cwd <dir>', 'Working directory')
    .option('--yes', 'Non-interactive; accept defaults')
    .action(async (flags: any) => {
      const cwd = resolveCwd(flags.cwd)
      const configPath = path.join(cwd, 'agentctx.config.ts')

      try {
        await fs.access(configPath)
        log('info', 'agentctx.config.ts already exists')
        return
      } catch {
        // continue
      }

      await fs.writeFile(configPath, defaultConfigTemplate, 'utf8')
      log('success', 'Created agentctx.config.ts')
    })
}
