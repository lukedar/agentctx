import os from 'node:os'
import path from 'node:path'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'

import { afterEach, describe, expect, it } from 'vitest'

import { workspaceContextDir, workspaceOutDir } from '../src/lib/paths'
import { runSync } from '../src/lib/sync/sync'

const tempDirs: string[] = []

describe('runSync', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs.splice(0).map(async (dir) => rm(dir, { recursive: true, force: true })),
    )
  })

  it('syncs context files even when output targets are filtered', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'agentctx-sync-'))
    tempDirs.push(root)

    await mkdir(workspaceOutDir(root), { recursive: true })
    await mkdir(workspaceContextDir(root), { recursive: true })

    await writeFile(path.join(workspaceOutDir(root), 'AGENTS.md'), '<!-- agentctx:start -->\nbody\n<!-- agentctx:end -->\n', 'utf8')
    await writeFile(path.join(workspaceContextDir(root), 'architecture.md'), '# Architecture\n\n- summary\n', 'utf8')

    const result = await runSync({
      cwd: root,
      targets: ['agents-md'],
    })

    expect(result.ok).toBe(true)
    expect(result.filesChanged).toBe(2)

    const syncedTarget = await readFile(path.join(root, 'AGENTS.md'), 'utf8')
    const syncedContext = await readFile(path.join(root, '.agentctx', 'context', 'architecture.md'), 'utf8')

    expect(syncedTarget).toContain('agentctx:start')
    expect(syncedContext).toContain('# Architecture')
  })

  it('syncs point outputs into the configured point path', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'agentctx-sync-point-'))
    tempDirs.push(root)

    await mkdir(path.join(root, 'packages', 'demo'), { recursive: true })
    await mkdir(path.join(root, '.agentctx', 'points', 'demo', 'out'), { recursive: true })
    await mkdir(path.join(root, '.agentctx', 'points', 'demo', 'context'), { recursive: true })

    await writeFile(
      path.join(root, '.agentctx', 'points', 'demo', 'out', 'AGENTS.md'),
      '<!-- agentctx:start -->\npoint body\n<!-- agentctx:end -->\n',
      'utf8',
    )
    await writeFile(
      path.join(root, '.agentctx', 'points', 'demo', 'context', 'testing.md'),
      '# Testing\n\n- point tests\n',
      'utf8',
    )

    const result = await runSync({
      cwd: root,
      scope: { kind: 'point', name: 'demo', pointPath: 'packages/demo' },
    })

    expect(result.ok).toBe(true)
    expect(result.filesChanged).toBe(2)

    const syncedTarget = await readFile(path.join(root, 'packages', 'demo', 'AGENTS.md'), 'utf8')
    const syncedContext = await readFile(
      path.join(root, 'packages', 'demo', '.agentctx', 'context', 'testing.md'),
      'utf8',
    )

    expect(syncedTarget).toContain('point body')
    expect(syncedContext).toContain('# Testing')
  })
})
