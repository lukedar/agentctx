import type { AgentCtxError } from '@agentctx/core'

import type { BuildResult } from './build/build'
import type { DriftReport } from './check/drift'
import type { SyncResult } from './sync/sync'

type CheckJsonScope = Readonly<{
  scopeKey: string
  drift?: DriftReport
  sync: SyncResult
  shouldFail: boolean
}>

export const formatBuildJson = (result: BuildResult) => ({
  ok: true as const,
  filesWritten: result.filesWritten,
  tokenEstimate: result.tokenEstimate,
  durationMs: result.durationMs,
  workspace: {
    filesWritten: result.workspace.filesWritten,
    compiledTokens: result.workspace.compiledTokens,
  },
  points: result.points.map((p) => ({
    scopeKey: p.scopeKey,
    filesWritten: p.filesWritten,
    compiledTokens: p.compiledTokens,
  })),
})

export const formatSyncJson = (result: SyncResult) => ({
  filesChanged: result.filesChanged,
  filesChecked: result.filesChecked,
  ok: result.ok,
  messages: [...result.messages],
})

export const formatCheckJson = (input: {
  ok: boolean
  thresholdPercent: number
  checks: readonly CheckJsonScope[]
}) => ({
  ok: input.ok,
  thresholdPercent: input.thresholdPercent,
  checks: input.checks.map((c) => ({
    scopeKey: c.scopeKey,
    drift: c.drift,
    sync: formatSyncJson(c.sync),
    shouldFail: c.shouldFail,
  })),
})

export const formatErrorJson = (error: AgentCtxError) => ({
  ok: false as const,
  error,
})
