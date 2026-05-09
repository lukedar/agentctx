import os from 'node:os'
import path from 'node:path'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'

import { afterEach, describe, expect, it } from 'vitest'

import { createRepoFileIndex } from '../src/repoFileIndex'
import type { AgentCtxConfig } from '../src/types'

const tempDirs: string[] = []

const createConfig = (rootDir: string): AgentCtxConfig => ({
  rootDir,
  scope: { kind: 'workspace' },
  contextPoints: [],
  targets: ['agents-md'],
  include: ['README.md', 'src/**', 'packages/**', 'docs-agentctx/**'],
  exclude: ['src/ignore.ts', '**/.agentctx/**', '**/.vitepress/cache/**', '**/dist/**'],
  contextBlocks: {
    architecture: true,
    conventions: true,
    api: true,
    database: true,
    frontend: true,
    testing: true,
    workflows: true,
    glossary: true,
  },
  budgets: {
    default: 'large',
    small: 4_000,
    medium: 12_000,
    large: 32_000,
  },
  drift: {
    failOnCheck: true,
    thresholdPercent: 10,
  },
  security: {
    redactSecrets: true,
    includeEnvValues: false,
    allowSourceSnippets: false,
  },
})

describe('createRepoFileIndex', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
  })

  it('indexes included files in stable order and respects excludes', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'agentctx-core-index-'))
    tempDirs.push(root)

    await mkdir(path.join(root, 'src'), { recursive: true })
    await mkdir(path.join(root, 'packages', 'demo', '.agentctx', 'context'), { recursive: true })
    await mkdir(path.join(root, 'docs-agentctx', '.vitepress', 'cache'), { recursive: true })
    await mkdir(path.join(root, 'packages', 'demo', 'dist'), { recursive: true })
    await writeFile(path.join(root, 'README.md'), '# Repo\n', 'utf8')
    await writeFile(path.join(root, 'src', 'a.ts'), 'export const a = 1\n', 'utf8')
    await writeFile(path.join(root, 'src', 'ignore.ts'), 'export const ignore = true\n', 'utf8')
    await writeFile(path.join(root, 'packages', 'demo', '.agentctx', 'context', 'architecture.md'), '# Generated\n', 'utf8')
    await writeFile(path.join(root, 'docs-agentctx', '.vitepress', 'cache', 'package.json'), '{}\n', 'utf8')
    await writeFile(path.join(root, 'packages', 'demo', 'dist', 'index.js'), 'console.log("generated")\n', 'utf8')

    const result = await createRepoFileIndex(createConfig(root))

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.files.map((file) => file.path)).toEqual([
      'README.md',
      'src/a.ts',
    ])
    expect(result.value.byPath['src/ignore.ts']).toBeUndefined()
    expect(result.value.byPath['packages/demo/.agentctx/context/architecture.md']).toBeUndefined()
    expect(result.value.byPath['docs-agentctx/.vitepress/cache/package.json']).toBeUndefined()
    expect(result.value.byPath['packages/demo/dist/index.js']).toBeUndefined()
  })
})
