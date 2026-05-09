import { defineConfig } from 'vitepress'

import { spawn } from 'node:child_process'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docsRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(docsRoot, '..')

const isLocal = (addr: string | undefined): boolean =>
  addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1'

const syncReport = async (): Promise<void> => {
  const src = path.join(repoRoot, '.dual-agent-runner', 'reports', 'dev-eval.json')
  const destDir = path.join(docsRoot, 'public', 'dual-agent-runner')
  const dest = path.join(destDir, 'dev-eval.json')

  await mkdir(destDir, { recursive: true })

  const raw = await readFile(src, 'utf8')
  const json = JSON.parse(raw)
  await writeFile(dest, JSON.stringify(json, null, 2) + '\n', 'utf8')
}

export default defineConfig({
  base: process.env.VITEPRESS_BASE ?? '/',
  lang: 'en-US',
  title: 'AgentCtx',
  description: 'Agent context for any repo, any framework, and any agent.',

  vite: {
    plugins: [
      {
        name: 'dar-docs-exec',
        configureServer(server) {
          if (process.env.DAR_DOCS_EXEC !== '1') return

          server.middlewares.use('/__dar/status', (req, res) => {
            if (!isLocal(req.socket.remoteAddress)) {
              res.statusCode = 403
              res.end('forbidden')
              return
            }

            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ enabled: true }))
          })

          server.middlewares.use('/__dar/eval', async (req, res) => {
            if (!isLocal(req.socket.remoteAddress)) {
              res.statusCode = 403
              res.end('forbidden')
              return
            }

            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end('method not allowed')
              return
            }

            const child = spawn('pnpm', ['da:eval'], {
              cwd: repoRoot,
              env: process.env,
              stdio: 'ignore',
            })

            const exitCode: number = await new Promise((resolve) => {
              child.on('close', (code) => resolve(code ?? 1))
            })

            let status = 'unknown'
            try {
              await syncReport()
              const synced = JSON.parse(
                await readFile(path.join(docsRoot, 'public', 'dual-agent-runner', 'dev-eval.json'), 'utf8'),
              )
              status = String(synced?.evaluation?.status ?? 'unknown')
            } catch {
              status = 'error'
            }

            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ ok: exitCode === 0, exitCode, status }))
          })
        },
      },
    ],
  },

  themeConfig: {
    nav: [
      { text: 'Overview', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Pipeline', link: '/pipeline' },
      { text: 'Dual Agent Runner', link: '/quality-gate' },
      { text: 'Benchmark', link: '/benchmark' },
      { text: 'CtxPoints', link: '/context-points' },
      { text: 'CtxBlocks', link: '/context-blocks' },
      { text: 'Targets', link: '/targets' },
      { text: 'Config', link: '/config' },
      { text: 'CLI', link: '/cli' },
    ],
    sidebar: [
      { text: 'Overview', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Pipeline', link: '/pipeline' },
      { text: 'Dual Agent Runner', link: '/quality-gate' },
      { text: 'Benchmark', link: '/benchmark' },
      { text: 'CtxPoints', link: '/context-points' },
      { text: 'CtxBlocks', link: '/context-blocks' },
      { text: 'Targets', link: '/targets' },
      { text: 'Config', link: '/config' },
      { text: 'CLI', link: '/cli' },
    ],
  },
})
