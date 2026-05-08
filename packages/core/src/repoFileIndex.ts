import { createHash } from 'node:crypto'
import { createReadStream, promises as fs } from 'node:fs'
import path from 'node:path'

import fg from 'fast-glob'

import type { AgentCtxConfig, RepoFile, RepoFileIndex, Result } from './types'

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

    const files: RepoFile[] = []
    const byPath: Record<string, RepoFile> = {}

    for (const relPath of sorted) {
      const absPath = path.join(rootDir, relPath)
      const stat = await fs.stat(absPath)
      if (!stat.isFile()) continue

      const file: RepoFile = {
        path: relPath,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        hash: await hashFileSha256(absPath),
      }

      files.push(file)
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
