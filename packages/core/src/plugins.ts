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

  return {
    rootDir: input.rootDir,
    files: input.files,
    readText: async (p: string) => fs.readFile(abs(p), 'utf8'),
    readJson: async <T = unknown>(p: string) => JSON.parse(await fs.readFile(abs(p), 'utf8')) as T,
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
