#!/usr/bin/env node

import { cac } from 'cac'

import { registerBuildCommand } from './commands/build'
import { registerCheckCommand } from './commands/check'
import { registerInitCommand } from './commands/init'
import { registerSyncCommand } from './commands/sync'

const cli = cac('agentctx')

cli.option('--cwd <dir>', 'Working directory')
cli.option('--json', 'Machine-readable output')

registerInitCommand(cli)
registerBuildCommand(cli)
registerSyncCommand(cli)
registerCheckCommand(cli)

cli.help()

cli.parse()
