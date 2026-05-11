import os from 'node:os'
import path from 'node:path'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'

import { afterEach, describe, expect, it } from 'vitest'

import { createRepoFileIndex } from '../src/repoFileIndex'
import { createScanContext, extractFacts } from '../src/plugins'
import type { AgentCtxConfig, AgentCtxPlugin } from '../src/types'

const tempDirs: string[] = []

const createConfig = (rootDir: string): AgentCtxConfig => ({
  rootDir,
  ctxPoints: [],
  targets: ['agents-md'],
  include: ['**/*'],
  exclude: [],
  ctxBlocks: {
    architecture: true,
    conventions: true,
    runtime: true,
    api: true,
    database: true,
    operations: true,
    data: true,
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

describe('plugin scanning', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
  })

  it('precomputes path helpers on scan context', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'agentctx-core-plugins-'))
    tempDirs.push(root)
    await mkdir(path.join(root, 'apps/web'), { recursive: true })
    await writeFile(path.join(root, 'apps/web/package.json'), '{"name":"web"}\n', 'utf8')

    const index = await createRepoFileIndex(createConfig(root))
    if (!index.ok) throw new Error(index.error.message)

    const ctx = createScanContext({ rootDir: root, files: index.value })

    expect(ctx.paths).toContain('apps/web/package.json')
    expect(ctx.basenames['apps/web/package.json']).toBe('package.json')
    expect(ctx.byBasename['package.json']).toEqual(['apps/web/package.json'])
    expect(ctx.matchPaths((_, basename) => basename === 'package.json')).toEqual(['apps/web/package.json'])
  })

  it('lets plugins reuse detection and extraction work', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'agentctx-core-plugins-'))
    tempDirs.push(root)
    await writeFile(path.join(root, 'package.json'), '{"name":"root"}\n', 'utf8')

    const index = await createRepoFileIndex(createConfig(root))
    if (!index.ok) throw new Error(index.error.message)

    let calls = 0
    const plugin: AgentCtxPlugin = {
      name: 'combined',
      async detect() {
        throw new Error('detect should not run when extractWithDetection is present')
      },
      async extract() {
        throw new Error('extract should not run when extractWithDetection is present')
      },
      async extractWithDetection() {
        calls += 1
        return {
          detection: { detected: true, confidence: 1 },
          facts: [{ kind: 'package', source: 'package.json', confidence: 1, data: { name: 'root' } }],
        }
      },
    }

    const result = await extractFacts({
      config: createConfig(root),
      files: index.value,
      plugins: [plugin],
    })

    expect(result.ok).toBe(true)
    expect(result.ok ? result.value : []).toHaveLength(1)
    expect(calls).toBe(1)
  })
})
