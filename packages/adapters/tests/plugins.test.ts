import os from 'node:os'
import path from 'node:path'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'

import { afterEach, describe, expect, it } from 'vitest'

import { createRepoFileIndex, createScanContext, type AgentCtxConfig, type ScanContext } from '@agentctx/core'

import { apiDatabaseFilesPlugin } from '../src/plugins/apiDatabaseFiles'
import { configFilesPlugin } from '../src/plugins/configFiles'
import { envExamplePlugin } from '../src/plugins/envExample'
import { frameworksFromPackageJsonPlugin } from '../src/plugins/frameworksFromPackageJson'
import { packageDependenciesPlugin } from '../src/plugins/packageDependencies'
import { packageMetadataPlugin } from '../src/plugins/packageMetadata'
import { packageManagerPlugin } from '../src/plugins/packageManager'
import { packageScriptsPlugin } from '../src/plugins/packageScripts'
import { routesFromFilesPlugin } from '../src/plugins/routesFromFiles'
import { testRunnersFromPackageJsonPlugin } from '../src/plugins/testRunnersFromPackageJson'

const tempDirs: string[] = []

const createConfig = (rootDir: string): AgentCtxConfig => ({
  rootDir,
  contextPoints: [],
  targets: ['agents-md'],
  include: ['**/*'],
  exclude: [],
  context: {
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

const buildContext = async (
  files: Readonly<Record<string, string>>,
): Promise<ScanContext> => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'agentctx-adapters-'))
  tempDirs.push(root)

  for (const [relPath, content] of Object.entries(files)) {
    await mkdir(path.join(root, path.dirname(relPath)), { recursive: true })
    await writeFile(path.join(root, relPath), content, 'utf8')
  }

  const indexResult = await createRepoFileIndex(createConfig(root))
  if (!indexResult.ok) throw new Error(indexResult.error.message)

  return createScanContext({
    rootDir: root,
    files: indexResult.value,
  })
}

describe('adapter plugins', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
  })

  it('extracts package-manager, framework, test-runner, and script facts from package metadata', async () => {
    const ctx = await buildContext({
      'pnpm-lock.yaml': 'lockfileVersion: 9.0\n',
      'package.json': JSON.stringify({
        name: 'fixture',
        dependencies: {
          react: '^19.0.0',
          vite: '^6.0.0',
          express: '^5.0.0',
        },
        devDependencies: {
          vitest: '^3.0.0',
        },
        scripts: {
          build: 'vite build',
          test: 'vitest run',
        },
      }, null, 2),
    })

    expect((await packageManagerPlugin.detect(ctx)).detected).toBe(true)
    expect(await packageManagerPlugin.extract(ctx)).toContainEqual(
      expect.objectContaining({ kind: 'package-manager', data: { name: 'pnpm' } }),
    )

    const packageFacts = await packageMetadataPlugin.extract(ctx)
    expect(packageFacts).toContainEqual(
      expect.objectContaining({ kind: 'package', data: expect.objectContaining({ name: 'fixture', path: '.' }) }),
    )

    const frameworks = await frameworksFromPackageJsonPlugin.extract(ctx)
    expect(frameworks).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'framework', data: { name: 'express' } }),
      expect.objectContaining({ kind: 'framework', data: { name: 'react' } }),
      expect.objectContaining({ kind: 'framework', data: { name: 'vite' } }),
    ]))

    const runners = await testRunnersFromPackageJsonPlugin.extract(ctx)
    expect(runners).toContainEqual(
      expect.objectContaining({ kind: 'test-runner', data: { name: 'vitest' } }),
    )

    const scripts = await packageScriptsPlugin.extract(ctx)
    expect(scripts).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'script', data: { name: 'build', command: 'vite build' } }),
      expect.objectContaining({ kind: 'script', data: { name: 'test', command: 'vitest run' } }),
    ]))

    const dependencies = await packageDependenciesPlugin.extract(ctx)
    expect(dependencies).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'dependency', data: expect.objectContaining({ packageName: 'fixture', name: 'react' }) }),
      expect.objectContaining({ kind: 'dependency', data: expect.objectContaining({ packageName: 'fixture', name: 'vitest' }) }),
    ]))
  })

  it('extracts config, env, api, and database facts from fixture files', async () => {
    const ctx = await buildContext({
      '.env.example': 'API_KEY=\nINTERNAL_TOKEN=\n',
      'eslint.config.js': 'export default []\n',
      'vitest.config.ts': 'export default {}\n',
      'openapi.yaml': 'openapi: 3.1.0\ninfo:\n  title: Fixture\n  version: 1.0.0\n',
      'schema.prisma': 'datasource db { provider = "sqlite" url = "file:dev.db" }\n',
      'src/routes/blog/[slug].ts': 'export const GET = () => {}\n',
      'app/api/health/route.ts': 'export async function GET() {}\n',
    })

    const configFacts = await configFilesPlugin.extract(ctx)
    expect(configFacts).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'convention', data: expect.objectContaining({ tool: 'eslint' }) }),
      expect.objectContaining({ kind: 'convention', data: expect.objectContaining({ tool: 'vitest' }) }),
    ]))

    const envFacts = await envExamplePlugin.extract(ctx)
    expect(envFacts).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'env-var', data: { name: 'API_KEY' } }),
      expect.objectContaining({ kind: 'env-var', data: { name: 'INTERNAL_TOKEN' } }),
    ]))

    const apiDbFacts = await apiDatabaseFilesPlugin.extract(ctx)
    expect(apiDbFacts).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'api', data: expect.objectContaining({ name: 'openapi' }) }),
      expect.objectContaining({ kind: 'database', data: expect.objectContaining({ name: 'prisma' }) }),
    ]))

    const routeFacts = await routesFromFilesPlugin.extract(ctx)
    expect(routeFacts).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'route', data: expect.objectContaining({ kind: 'filesystem-route', path: '/blog/[slug]' }) }),
      expect.objectContaining({ kind: 'route', data: expect.objectContaining({ kind: 'next-app-api', path: '/health' }) }),
    ]))
  })

  it('returns no facts when the expected fixture files are absent', async () => {
    const ctx = await buildContext({
      'README.md': '# Fixture\n',
    })

    expect((await packageManagerPlugin.detect(ctx)).detected).toBe(false)
    expect(await frameworksFromPackageJsonPlugin.extract(ctx)).toEqual([])
    expect(await envExamplePlugin.extract(ctx)).toEqual([])
    expect(await apiDatabaseFilesPlugin.extract(ctx)).toEqual([])
    expect(await routesFromFilesPlugin.extract(ctx)).toEqual([])
  })
})
