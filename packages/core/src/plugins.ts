import { promises as fs } from 'node:fs'
import path from 'node:path'

import type {
  AgentCtxConfig,
  AgentCtxPlugin,
  Fact,
  RepoFileIndex,
  Result,
  ScanContext,
} from './types'

const stableStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const createScanContext = (input: { rootDir: string; files: RepoFileIndex }): ScanContext => {
  const abs = (p: string) => path.isAbsolute(p) ? p : path.join(input.rootDir, p)
  const paths = input.files.files.map((file) => file.path)
  const basenames: Record<string, string> = {}
  const byBasenameMutable = new Map<string, string[]>()
  const textCache = new Map<string, Promise<string>>()
  const jsonCache = new Map<string, Promise<unknown>>()

  for (const filePath of paths) {
    const base = path.posix.basename(filePath)
    basenames[filePath] = base
    const existing = byBasenameMutable.get(base)
    if (existing) existing.push(filePath)
    else byBasenameMutable.set(base, [filePath])
  }

  const byBasename = Object.fromEntries(
    [...byBasenameMutable.entries()].map(([base, filePaths]) => [
      base,
      [...filePaths].sort((a, b) => a.localeCompare(b)),
    ]),
  ) as Record<string, readonly string[]>

  const readTextCached = (p: string): Promise<string> => {
    const normalized = path.isAbsolute(p) ? path.relative(input.rootDir, p) : p
    const existing = textCache.get(normalized)
    if (existing) return existing

    const read = fs.readFile(abs(normalized), 'utf8')
    textCache.set(normalized, read)
    return read
  }

  return {
    rootDir: input.rootDir,
    files: input.files,
    paths,
    basenames,
    byBasename,
    matchPaths: (predicate) => paths.filter((filePath) => predicate(filePath, basenames[filePath] ?? path.posix.basename(filePath))),
    readText: readTextCached,
    readJson: async <T = unknown>(p: string) => {
      const normalized = path.isAbsolute(p) ? path.relative(input.rootDir, p) : p
      const existing = jsonCache.get(normalized)
      if (existing) return await existing as T

      const read = readTextCached(normalized).then((content) => JSON.parse(content) as unknown)
      jsonCache.set(normalized, read)
      return await read as T
    },
  }
}

export const extractFacts = async (input: {
  config: AgentCtxConfig
  files: RepoFileIndex
  plugins: readonly AgentCtxPlugin[]
}): Promise<Result<readonly Fact[]>> => {
  try {
    const ctx = createScanContext({ rootDir: input.config.rootDir, files: input.files })

    const facts: Fact[] = []

    for (const plugin of input.plugins) {
      if (plugin.extractWithDetection) {
        const result = await plugin.extractWithDetection(ctx)
        if (!result.detection.detected) continue
        for (const f of result.facts) facts.push(f)
        continue
      }

      const detection = await plugin.detect(ctx)
      if (!detection.detected) continue

      const extracted = await plugin.extract(ctx)
      for (const f of extracted) facts.push(f)
    }

    const sorted = [...facts].sort((a, b) => {
      const k = a.kind.localeCompare(b.kind)
      if (k !== 0) return k

      const s = a.source.localeCompare(b.source)
      if (s !== 0) return s

      return stableStringify(a.data).localeCompare(stableStringify(b.data))
    })

    return { ok: true, value: sorted }
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'fact_extraction_failed',
        message: 'Failed to extract facts',
        cause: err,
      },
    }
  }
}
