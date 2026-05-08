import { promises as fs } from 'node:fs'
import path from 'node:path'

export const ensureDir = async (dir: string): Promise<void> => {
  await fs.mkdir(dir, { recursive: true })
}

export const readTextIfExists = async (filePath: string): Promise<string | undefined> => {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return undefined
  }
}

export const writeTextIfChanged = async (filePath: string, content: string): Promise<{ changed: boolean }> => {
  const existing = await readTextIfExists(filePath)
  if (existing === content) return { changed: false }

  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, content, 'utf8')
  return { changed: true }
}
