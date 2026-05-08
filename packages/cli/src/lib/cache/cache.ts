import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { Fact, RepoFileIndex } from '@agentctx/core'

import { cacheDir } from '../paths'

export type AgentCtxCacheV1 = Readonly<{
  version: 1
  configHash: string
  fileHashes: Readonly<Record<string, string>>
}>

export type CachedFactsV1 = Readonly<{
  version: 1
  configHash: string
  facts: readonly Fact[]
}>

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex')

export const hashConfig = (config: unknown): string => sha256(JSON.stringify(config))

const indexPath = (rootDir: string, scopeKey: string) =>
  path.join(cacheDir(rootDir), scopeKey, 'index.json')
const factsPath = (rootDir: string, scopeKey: string) =>
  path.join(cacheDir(rootDir), scopeKey, 'facts.json')

export const readCacheIndex = async (
  rootDir: string,
  scopeKey = 'workspace',
): Promise<AgentCtxCacheV1 | undefined> => {
  try {
    const raw = await fs.readFile(indexPath(rootDir, scopeKey), 'utf8')
    return JSON.parse(raw) as AgentCtxCacheV1
  } catch {
    return undefined
  }
}

export const writeCacheIndex = async (
  rootDir: string,
  cache: AgentCtxCacheV1,
  scopeKey = 'workspace',
): Promise<void> => {
  await fs.mkdir(path.join(cacheDir(rootDir), scopeKey), { recursive: true })
  await fs.writeFile(indexPath(rootDir, scopeKey), JSON.stringify(cache, null, 2) + '\n', 'utf8')
}

export const readCachedFacts = async (
  rootDir: string,
  scopeKey = 'workspace',
): Promise<CachedFactsV1 | undefined> => {
  try {
    const raw = await fs.readFile(factsPath(rootDir, scopeKey), 'utf8')
    return JSON.parse(raw) as CachedFactsV1
  } catch {
    return undefined
  }
}

export const writeCachedFacts = async (
  rootDir: string,
  facts: CachedFactsV1,
  scopeKey = 'workspace',
): Promise<void> => {
  await fs.mkdir(path.join(cacheDir(rootDir), scopeKey), { recursive: true })
  await fs.writeFile(factsPath(rootDir, scopeKey), JSON.stringify(facts, null, 2) + '\n', 'utf8')
}

export const computeFileHashes = (index: RepoFileIndex): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const f of index.files) out[f.path] = f.hash
  return out
}

export const getChangedFiles = (prev: AgentCtxCacheV1, current: RepoFileIndex): readonly string[] => {
  const changed: string[] = []
  for (const f of current.files) {
    const old = prev.fileHashes[f.path]
    if (!old || old !== f.hash) changed.push(f.path)
  }
  return changed
}
