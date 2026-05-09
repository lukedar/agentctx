import path from 'node:path'
import { promises as fs } from 'node:fs'

import type { TargetName } from '@agentctx/core'

import { readTextIfExists, writeTextIfChanged } from '../fs'
import { pointContextDir, pointOutDir, workspaceContextDir, workspaceOutDir } from '../paths'
import { mergeGeneratedContent } from './generatedBlock'

export type SyncScope =
  | Readonly<{ kind: 'workspace' }>
  | Readonly<{ kind: 'point'; name: string; pointPath: string }>

export type SyncOptions = Readonly<{
  cwd: string
  dryRun?: boolean
  check?: boolean
  targets?: readonly TargetName[]
  scope?: SyncScope
}>

export type SyncResult = Readonly<{
  filesChanged: number
  filesChecked: number
  ok: boolean
  messages: readonly string[]
}>

const TARGET_OUTPUT_PATHS: Readonly<Record<TargetName, readonly string[]>> = {
  'agents-md': ['AGENTS.md'],
  claude: ['CLAUDE.md'],
  cursor: ['.cursor/rules/project.mdc'],
  copilot: ['.github/copilot-instructions.md'],
  llms: ['llms.txt'],
}

const shouldIncludePath = (relPath: string, targets?: readonly TargetName[]): boolean => {
  if (!targets || targets.length === 0) return true

  const wanted = new Set(targets.flatMap((target) => TARGET_OUTPUT_PATHS[target]))
  return wanted.has(relPath)
}

const listOutFiles = async (baseOutDir: string): Promise<readonly string[]> => {
  const out: string[] = []

  const walk = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) await walk(full)
      else out.push(path.relative(baseOutDir, full))
    }
  }

  try {
    await walk(baseOutDir)
  } catch {
    return []
  }

  return out.sort((a, b) => a.localeCompare(b))
}

export const runSync = async (opts: SyncOptions): Promise<SyncResult> => {
  const scope = opts.scope ?? ({ kind: 'workspace' } as const)

  const builtRoot =
    scope.kind === 'workspace'
      ? workspaceOutDir(opts.cwd)
      : pointOutDir(opts.cwd, scope.name)

  const contextRoot =
    scope.kind === 'workspace'
      ? workspaceContextDir(opts.cwd)
      : pointContextDir(opts.cwd, scope.name)

  const destRoot =
    scope.kind === 'workspace'
      ? opts.cwd
      : path.join(opts.cwd, scope.pointPath)

  const destContextRoot = path.join(destRoot, '.agentctx', 'context')

  const outFiles = await listOutFiles(builtRoot)
  const contextFiles = await listOutFiles(contextRoot)

  const messages: string[] = []

  let changed = 0
  let checked = 0
  let ok = true

  for (const rel of outFiles) {
    if (!shouldIncludePath(rel, opts.targets)) continue

    const builtPath = path.join(builtRoot, rel)
    const destPath = path.join(destRoot, rel)

    const generated = await fs.readFile(builtPath, 'utf8')
    const existing = await readTextIfExists(destPath)

    const merged = mergeGeneratedContent(existing, generated)

    if (opts.check) {
      checked++
      if ((existing ?? '') !== merged) {
        ok = false
        messages.push(`Stale: ${rel}`)
      }
      continue
    }

    if (opts.dryRun) {
      checked++
      if ((existing ?? '') !== merged) messages.push(`Would update: ${rel}`)
      continue
    }

    const r = await writeTextIfChanged(destPath, merged)
    checked++
    if (r.changed) {
      changed++
      messages.push(`Updated: ${rel}`)
    }
  }

  for (const rel of contextFiles) {
    const builtPath = path.join(contextRoot, rel)
    const destPath = path.join(destContextRoot, rel)

    const generated = await fs.readFile(builtPath, 'utf8')
    const existing = await readTextIfExists(destPath)

    if (opts.check) {
      checked++
      if ((existing ?? '') !== generated) {
        ok = false
        messages.push(`Stale: .agentctx/context/${rel}`)
      }
      continue
    }

    if (opts.dryRun) {
      checked++
      if ((existing ?? '') !== generated) messages.push(`Would update: .agentctx/context/${rel}`)
      continue
    }

    const r = await writeTextIfChanged(destPath, generated)
    checked++
    if (r.changed) {
      changed++
      messages.push(`Updated: .agentctx/context/${rel}`)
    }
  }

  return { filesChanged: changed, filesChecked: checked, ok, messages }
}
