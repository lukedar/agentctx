import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'

import { afterEach, describe, expect, it } from 'vitest'

import { loadConfig } from '../src/config'

const tempDirs: string[] = []

describe('loadConfig', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
  })

  it('applies defaults to a minimal config file', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'agentctx-core-config-'))
    tempDirs.push(root)

    await writeFile(path.join(root, 'agentctx.config.ts'), 'export default { targets: ["claude"] }\n', 'utf8')

    const result = await loadConfig(root)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.targets).toEqual(['claude'])
    expect(result.value.budgets.default).toBe('large')
    expect(result.value.ctxBlocks.architecture).toBe(true)
    expect(result.value.security.redactSecrets).toBe(true)
    expect(result.value.include).toEqual(expect.arrayContaining([
      'pyproject.toml',
      '**/*.csproj',
      'Dockerfile*',
      '.github/workflows/**',
      'dbt_project.yml',
    ]))
    expect(result.value.exclude).toEqual(expect.arrayContaining([
      '.agentctx/**',
      '**/.agentctx/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      '**/dist/**',
      '**/.venv/**',
      '**/bin/**',
      '**/.terraform/**',
    ]))
  })

  it('returns a typed validation error for an unsupported target', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'agentctx-core-config-'))
    tempDirs.push(root)

    await writeFile(path.join(root, 'agentctx.config.ts'), 'export default { targets: ["windsurf"] }\n', 'utf8')

    const result = await loadConfig(root)

    expect(result.ok).toBe(false)
    if (result.ok) return

    expect(result.error.code).toBe('config_invalid')
  })
})
