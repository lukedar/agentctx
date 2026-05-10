import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const docsDir = process.cwd()
const src = path.resolve(docsDir, '../.dual-agent-runner/reports/dev-eval.json')
const destDir = path.resolve(docsDir, './public/dual-agent-runner')
const dest = path.join(destDir, 'dev-eval.json')
const benchmarkSrc = path.resolve(docsDir, '../.dual-agent-runner/benchmark-results.json')
const benchmarkDestDir = path.resolve(docsDir, './public/benchmark')
const benchmarkDest = path.join(benchmarkDestDir, 'results.json')

const fallback = {
  version: 1,
  task: { id: 'dev-eval', title: 'Development evaluation gate' },
  evaluation: { status: 'missing', average: 0, scores: {} },
  checks: [],
}

await mkdir(destDir, { recursive: true })
await mkdir(benchmarkDestDir, { recursive: true })

try {
  const raw = await readFile(src, 'utf8')
  const json = JSON.parse(raw)
  await writeFile(dest, JSON.stringify(json, null, 2) + '\n', 'utf8')
  // eslint-disable-next-line no-console
  console.log(`[docs-agentctx] synced dual-agent report -> ${path.relative(docsDir, dest)}`)
} catch {
  await writeFile(dest, JSON.stringify(fallback, null, 2) + '\n', 'utf8')
  // eslint-disable-next-line no-console
  console.warn(`[docs-agentctx] no dev-eval.json found; wrote fallback -> ${path.relative(docsDir, dest)}`)
}

try {
  const raw = await readFile(benchmarkSrc, 'utf8')
  const json = JSON.parse(raw)
  await writeFile(benchmarkDest, JSON.stringify(json, null, 2) + '\n', 'utf8')
  // eslint-disable-next-line no-console
  console.log(`[docs-agentctx] synced benchmark results -> ${path.relative(docsDir, benchmarkDest)}`)
} catch {
  await writeFile(benchmarkDest, JSON.stringify({ version: 1, results: [] }, null, 2) + '\n', 'utf8')
  // eslint-disable-next-line no-console
  console.warn(`[docs-agentctx] no benchmark-results.json found; wrote fallback -> ${path.relative(docsDir, benchmarkDest)}`)
}
