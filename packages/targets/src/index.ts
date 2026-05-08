export * from './agentsMd'
export * from './claude'
export * from './cursor'
export * from './copilot'
export * from './llms'
export * from './utils'

import type { TargetAdapter, TargetName } from '@agentctx/core'

import { agentsMdTarget } from './agentsMd'
import { claudeTarget } from './claude'
import { copilotTarget } from './copilot'
import { cursorTarget } from './cursor'
import { llmsTarget } from './llms'

export const mvpTargets: Readonly<Record<TargetName, TargetAdapter>> = {
  'agents-md': agentsMdTarget,
  claude: claudeTarget,
  cursor: cursorTarget,
  copilot: copilotTarget,
  llms: llmsTarget,
}
