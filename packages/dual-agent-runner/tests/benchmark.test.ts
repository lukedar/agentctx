import os from 'node:os'
import path from 'node:path'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'

import { afterEach, describe, expect, it } from 'vitest'

import {
  createBenchmarkSuiteForRepo,
  prepareBenchmarkRun,
  renderBenchmarkReportMarkdown,
  summarizeBenchmarkRun,
  validateBenchmarkSuite,
} from '../src/benchmark'

const tempDirs: string[] = []

describe('benchmark', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
  })

  it('creates a repo-shaped suite with required comparison conditions', async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), 'dar-benchmark-repo-'))
    tempDirs.push(repo)

    await mkdir(path.join(repo, 'Source'), { recursive: true })
    await mkdir(path.join(repo, 'Documentation'), { recursive: true })
    await mkdir(path.join(repo, 'Data'), { recursive: true })
    await mkdir(path.join(repo, 'Tools', 'Python'), { recursive: true })
    await writeFile(path.join(repo, 'Tools', 'Python', 'requirements.txt'), 'pytest\n', 'utf8')

    const suite = await createBenchmarkSuiteForRepo(repo)

    expect(suite.conditions).toEqual(['no-context', 'agentctx-context'])
    expect(suite.tasks.map((task) => task.difficulty)).toContain('complex')
    expect(validateBenchmarkSuite(suite)).toEqual([])
    expect(suite.repoProfile).toContain('.NET source monorepo')
  })

  it('prepares prompts and pending result templates for each condition', async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), 'dar-benchmark-repo-'))
    const outDir = await mkdtemp(path.join(os.tmpdir(), 'dar-benchmark-run-'))
    tempDirs.push(repo, outDir)

    await writeFile(path.join(repo, 'AGENTS.md'), '# Context\n\nUse this repo carefully.\n', 'utf8')
    const suite = await createBenchmarkSuiteForRepo(repo)
    const summary = await prepareBenchmarkRun({ suite, repoDir: repo, outDir })

    expect(summary.contextEstimatedTokens).toBeGreaterThan(0)

    const rebuiltSummary = await summarizeBenchmarkRun({ suite, runDir: outDir })
    expect(rebuiltSummary.contextEstimatedTokens).toBe(summary.contextEstimatedTokens)

    await writeFile(path.join(outDir, 'report.json'), JSON.stringify({ contextEstimatedTokens: 0 }), 'utf8')
    const recoveredSummary = await summarizeBenchmarkRun({ suite, runDir: outDir })
    expect(recoveredSummary.contextEstimatedTokens).toBe(summary.contextEstimatedTokens)

    const prompt = await readFile(
      path.join(outDir, 'tasks', suite.tasks[0]?.id ?? '', 'agentctx-context', 'prompt.md'),
      'utf8',
    )
    expect(prompt).toContain('Use generated AgentCtx files')

    const result = JSON.parse(await readFile(
      path.join(outDir, 'tasks', suite.tasks[0]?.id ?? '', 'no-context', 'result.json'),
      'utf8',
    )) as { status: string }
    expect(result.status).toBe('pending')
  })

  it('classifies AgentCtx as helped when it passes and no-context fails', async () => {
    const repo = await mkdtemp(path.join(os.tmpdir(), 'dar-benchmark-repo-'))
    const outDir = await mkdtemp(path.join(os.tmpdir(), 'dar-benchmark-run-'))
    tempDirs.push(repo, outDir)

    const suite = await createBenchmarkSuiteForRepo(repo)
    await prepareBenchmarkRun({ suite, repoDir: repo, outDir })

    const taskId = suite.tasks[0]?.id ?? ''
    await writeFile(
      path.join(outDir, 'tasks', taskId, 'no-context', 'result.json'),
      JSON.stringify({ taskId, condition: 'no-context', status: 'fail', evaluatorScore: 2 }, null, 2),
      'utf8',
    )
    await writeFile(
      path.join(outDir, 'tasks', taskId, 'agentctx-context', 'result.json'),
      JSON.stringify({ taskId, condition: 'agentctx-context', status: 'pass', evaluatorScore: 4 }, null, 2),
      'utf8',
    )

    const summary = await summarizeBenchmarkRun({ suite, runDir: outDir })
    expect(summary.comparisons[0]?.outcome).toBe('helped')
    expect(renderBenchmarkReportMarkdown(summary)).toContain('Helped / hurt / neutral / inconclusive')
  })
})
