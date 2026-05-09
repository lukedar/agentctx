import path from 'node:path'

import {
  buildGraph,
  createRepoFileIndex,
  extractFacts,
  loadConfig,
  planCtxBlocks,
  type AgentCtxConfig,
  type ContextFile,
  type Fact,
  type TargetName,
} from '@agentctx/core'
import { mvpPlugins } from '@agentctx/adapters'
import { mvpTargets } from '@agentctx/targets'

import { ensureDir, writeTextIfChanged } from '../fs'
import {
  computeFileHashes,
  getChangedFiles,
  hashConfig,
  readCacheIndex,
  readCachedFacts,
  writeCachedFacts,
  writeCacheIndex,
} from '../cache/cache'
import {
  pointContextDir,
  pointDir,
  pointOutDir,
  workspaceContextDir,
  workspaceDir,
  workspaceOutDir,
} from '../paths'
import { createPointConfig, selectContextPoints } from '../points'
import { redactSecrets } from '../security/redact'

export type BuildOptions = Readonly<{
  cwd: string
  dryRun?: boolean
  changed?: boolean
  targets?: readonly TargetName[]
  points?: readonly string[]
}>

export type BuildScopeResult = Readonly<{
  scopeKey: string
  facts: readonly Fact[]
  filesWritten: number
  compiledTokens: number
}>

export type BuildResult = Readonly<{
  config: AgentCtxConfig
  filesWritten: number
  durationMs: number
  tokenEstimate: {
    compiled: number
  }
  workspace: BuildScopeResult
  points: readonly BuildScopeResult[]
}>

const nowMs = () => Date.now()

const pickTargets = (config: AgentCtxConfig, flags?: readonly TargetName[]): readonly TargetName[] =>
  flags && flags.length ? [...flags] : [...config.targets]

const buildScope = async (input: {
  scopeKey: string
  config: AgentCtxConfig
  scopeDirAbs: string
  contextDirAbs: string
  outDirAbs: string
  dryRun?: boolean
  changed?: boolean
  targetsOverride?: readonly TargetName[]
}): Promise<BuildScopeResult> => {
  const configHash = hashConfig(input.config)

  const indexRes = await createRepoFileIndex(input.config)
  if (!indexRes.ok) throw new Error(indexRes.error.message)
  const index = indexRes.value

  let facts: readonly Fact[] | undefined

  const prevIndex = await readCacheIndex(input.config.rootDir, input.scopeKey)
  const prevFacts = await readCachedFacts(input.config.rootDir, input.scopeKey)

  if (
    input.changed &&
    prevIndex &&
    prevFacts &&
    prevIndex.configHash === configHash &&
    prevFacts.configHash === configHash
  ) {
    const changedFiles = getChangedFiles(prevIndex, index)
    if (changedFiles.length === 0) facts = prevFacts.facts
  }

  if (!facts) {
    const factsRes = await extractFacts({ config: input.config, files: index, plugins: mvpPlugins })
    if (!factsRes.ok) throw new Error(factsRes.error.message)
    facts = factsRes.value

    await writeCacheIndex(
      input.config.rootDir,
      {
        version: 1,
        configHash,
        fileHashes: computeFileHashes(index),
      },
      input.scopeKey,
    )
    await writeCachedFacts(input.config.rootDir, { version: 1, configHash, facts }, input.scopeKey)
  }

  const graph = buildGraph(facts, input.config)
  const ctxBlocks = planCtxBlocks(graph, input.config)

  const selectedTargets = pickTargets(input.config, input.targetsOverride)

  const renderedFiles: ContextFile[] = []
  for (const name of selectedTargets) {
    const adapter = mvpTargets[name]

    const files = await adapter.render({
      graph,
      ctxBlocks,
      config: input.config,
    })
    for (const f of files) renderedFiles.push(f)
  }

  let written = 0
  const compiledTokens = ctxBlocks.reduce((acc, block) => acc + block.tokenEstimate, 0)

  if (!input.dryRun) {
    await ensureDir(input.scopeDirAbs)
    await ensureDir(input.contextDirAbs)
    await ensureDir(input.outDirAbs)

    const factsJson = redactSecrets(JSON.stringify({ version: 1, scopeKey: input.scopeKey, facts }, null, 2) + '\n')
    const graphJson = redactSecrets(JSON.stringify({ version: 1, scopeKey: input.scopeKey, graph }, null, 2) + '\n')
    const metricsJson = redactSecrets(
      JSON.stringify(
        {
          version: 1,
          scopeKey: input.scopeKey,
          facts: facts.length,
          compiledTokens,
        },
        null,
        2,
      ) + '\n',
    )

    for (const [fileName, content] of [
      ['facts.json', factsJson],
      ['graph.json', graphJson],
      ['metrics.json', metricsJson],
    ] as const) {
      const p = path.join(input.scopeDirAbs, fileName)
      const r = await writeTextIfChanged(p, content)
      if (r.changed) written++
    }

    for (const block of ctxBlocks) {
      const p = path.join(input.contextDirAbs, `${block.name}.md`)
      const safe = redactSecrets(block.content)
      const r = await writeTextIfChanged(p, safe)
      if (r.changed) written++
    }

    for (const f of renderedFiles) {
      const p = path.join(input.outDirAbs, f.path)
      const safe = redactSecrets(f.content)
      const r = await writeTextIfChanged(p, safe)
      if (r.changed) written++
    }
  }

  return {
    scopeKey: input.scopeKey,
    facts,
    filesWritten: written,
    compiledTokens,
  }
}

export const runBuild = async (opts: BuildOptions): Promise<BuildResult> => {
  const start = nowMs()

  const cfgRes = await loadConfig(opts.cwd)
  if (!cfgRes.ok) throw new Error(cfgRes.error.message)
  const workspaceConfig = cfgRes.value

  const pointsToBuild = selectContextPoints(workspaceConfig, opts.points ?? [])

  const workspace = await buildScope({
    scopeKey: 'workspace',
    config: workspaceConfig,
    scopeDirAbs: workspaceDir(workspaceConfig.rootDir),
    contextDirAbs: workspaceContextDir(workspaceConfig.rootDir),
    outDirAbs: workspaceOutDir(workspaceConfig.rootDir),
    ...(opts.dryRun === undefined ? {} : { dryRun: opts.dryRun }),
    ...(opts.changed === undefined ? {} : { changed: opts.changed }),
    ...(opts.targets === undefined ? {} : { targetsOverride: opts.targets }),
  })

  const pointResults: BuildScopeResult[] = []
  for (const p of pointsToBuild) {
    const pointConfig = createPointConfig(workspaceConfig, p)
    const targetsOverride = opts.targets ?? p.targets

    const res = await buildScope({
      scopeKey: `points/${p.name}`,
      config: pointConfig,
      scopeDirAbs: pointDir(workspaceConfig.rootDir, p.name),
      contextDirAbs: pointContextDir(workspaceConfig.rootDir, p.name),
      outDirAbs: pointOutDir(workspaceConfig.rootDir, p.name),
      ...(opts.dryRun === undefined ? {} : { dryRun: opts.dryRun }),
      ...(opts.changed === undefined ? {} : { changed: opts.changed }),
      ...(targetsOverride === undefined ? {} : { targetsOverride }),
    })
    pointResults.push(res)
  }

  const totalCompiled = workspace.compiledTokens + pointResults.reduce((a, r) => a + r.compiledTokens, 0)
  const totalWritten = workspace.filesWritten + pointResults.reduce((a, r) => a + r.filesWritten, 0)

  return {
    config: workspaceConfig,
    filesWritten: totalWritten,
    durationMs: nowMs() - start,
    tokenEstimate: { compiled: totalCompiled },
    workspace,
    points: pointResults,
  }
}
