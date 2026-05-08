import path from 'node:path'

import type { AgentCtxPlugin, DetectionResult, Fact, ScanContext } from '@agentctx/core'

type MatchSpec = Readonly<{
  tool: string
  reason: string
  match: (p: string, base: string) => boolean
}>

const specs: readonly MatchSpec[] = [
  {
    tool: 'editorconfig',
    reason: 'EditorConfig file',
    match: (_p, base) => base === '.editorconfig',
  },
  {
    tool: 'prettier',
    reason: 'Prettier configuration',
    match: (p, base) =>
      base.startsWith('.prettierrc') ||
      base === 'prettier.config.js' ||
      base === 'prettier.config.cjs' ||
      base === 'prettier.config.mjs' ||
      base === 'prettier.config.ts' ||
      base === 'prettier.config.json' ||
      p.endsWith('/.prettierrc') ||
      p.endsWith('/.prettierrc.json') ||
      p.endsWith('/.prettierrc.yml') ||
      p.endsWith('/.prettierrc.yaml') ||
      p.endsWith('/.prettierrc.js') ||
      p.endsWith('/.prettierrc.cjs'),
  },
  {
    tool: 'eslint',
    reason: 'ESLint configuration',
    match: (p, base) =>
      base === 'eslint.config.js' ||
      base === 'eslint.config.cjs' ||
      base === 'eslint.config.mjs' ||
      base === 'eslint.config.ts' ||
      base.startsWith('.eslintrc') ||
      p.endsWith('/.eslintrc') ||
      p.endsWith('/.eslintrc.json') ||
      p.endsWith('/.eslintrc.yml') ||
      p.endsWith('/.eslintrc.yaml') ||
      p.endsWith('/.eslintrc.js') ||
      p.endsWith('/.eslintrc.cjs'),
  },
  {
    tool: 'stylelint',
    reason: 'Stylelint configuration',
    match: (p, base) =>
      base === 'stylelint.config.js' ||
      base === 'stylelint.config.cjs' ||
      base === 'stylelint.config.mjs' ||
      base === 'stylelint.config.ts' ||
      base.startsWith('.stylelintrc') ||
      p.endsWith('/.stylelintrc') ||
      p.endsWith('/.stylelintrc.json') ||
      p.endsWith('/.stylelintrc.yml') ||
      p.endsWith('/.stylelintrc.yaml') ||
      p.endsWith('/.stylelintrc.js') ||
      p.endsWith('/.stylelintrc.cjs'),
  },
  {
    tool: 'typescript',
    reason: 'TypeScript configuration',
    match: (p, base) => base === 'tsconfig.json' || (base.startsWith('tsconfig.') && base.endsWith('.json')),
  },
  {
    tool: 'angular-cli',
    reason: 'Angular CLI workspace configuration',
    match: (_p, base) => base === 'angular.json',
  },
  {
    tool: 'nx',
    reason: 'Nx workspace configuration',
    match: (_p, base) => base === 'nx.json',
  },
  {
    tool: 'playwright',
    reason: 'Playwright configuration',
    match: (_p, base) => base.startsWith('playwright.config.'),
  },
  {
    tool: 'cypress',
    reason: 'Cypress configuration',
    match: (_p, base) => base.startsWith('cypress.config.'),
  },
  {
    tool: 'vitest',
    reason: 'Vitest configuration',
    match: (_p, base) => base.startsWith('vitest.config.'),
  },
  {
    tool: 'jest',
    reason: 'Jest configuration',
    match: (_p, base) => base.startsWith('jest.config.'),
  },
  {
    tool: 'karma',
    reason: 'Karma configuration',
    match: (_p, base) => base === 'karma.conf.js' || base === 'karma.conf.cjs' || base === 'karma.conf.ts',
  },
]

const toFacts = (paths: readonly string[]): readonly Fact[] => {
  const out: Fact[] = []

  for (const p of paths) {
    const base = path.posix.basename(p)
    for (const s of specs) {
      if (!s.match(p, base)) continue

      out.push({
        kind: 'convention',
        source: p,
        confidence: 0.8,
        data: {
          tool: s.tool,
          path: p,
          reason: s.reason,
        },
      })
    }
  }

  return out
}

export const configFilesPlugin: AgentCtxPlugin = {
  name: 'config-files',

  async detect(ctx): Promise<DetectionResult> {
    const paths = ctx.files.files.map((f) => f.path)
    const detected = toFacts(paths).length > 0

    return {
      detected,
      confidence: detected ? 0.6 : 0,
      reason: detected ? 'Found common tooling config files' : 'No common tooling config files found',
    }
  },

  async extract(ctx: ScanContext): Promise<readonly Fact[]> {
    const paths = ctx.files.files.map((f) => f.path)
    return toFacts(paths)
  },
}
