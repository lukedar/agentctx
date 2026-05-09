import { createHash } from 'node:crypto'
import { createReadStream, promises as fs } from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'

import type { AgentCtxConfig, RepoFile, RepoFileIndex, Result } from './types'

const DEFAULT_INDEX_CONCURRENCY = 32

export const hashFileSha256 = async (absolutePath: string): Promise<string> => {
  const hash = createHash('sha256')

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(absolutePath)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve())
  })

  return hash.digest('hex')
}

const mapConcurrent = async <T, U>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<U>,
): Promise<readonly U[]> => {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1))
  const output = new Array<U>(items.length)
  let nextIndex = 0

  const worker = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      output[currentIndex] = await mapper(items[currentIndex] as T)
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()))
  return output
}

export const createRepoFileIndex = async (config: AgentCtxConfig): Promise<Result<RepoFileIndex>> => {
  try {
    const rootDir = config.rootDir

    const paths = await fg(config.include as string[], {
      cwd: rootDir,
      dot: true,
      onlyFiles: true,
      unique: true,
      ignore: config.exclude as string[],
      followSymbolicLinks: false,
    })

    const sorted = [...paths].sort((a, b) => a.localeCompare(b))

    const indexedFiles = await mapConcurrent(sorted, DEFAULT_INDEX_CONCURRENCY, async (relPath) => {
      const absPath = path.join(rootDir, relPath)
      const stat = await fs.stat(absPath)
      if (!stat.isFile()) return undefined

      return {
        path: relPath,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        hash: await hashFileSha256(absPath),
      } satisfies RepoFile
    })

    const files: RepoFile[] = indexedFiles.filter((file): file is RepoFile => Boolean(file))
    const byPath: Record<string, RepoFile> = {}

    for (const file of files) {
      byPath[file.path] = file
    }

    return { ok: true, value: { rootDir, files, byPath } }
  } catch (err) {
    return {
      ok: false,
      error: {
        code: 'repo_index_failed',
        message: 'Failed to create repository file index',
        cause: err,
      },
    }
  }
}
