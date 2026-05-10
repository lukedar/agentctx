import type { ContextFile, TargetAdapter } from '@agentctx/core'

import { getCtxBlocks, getContextFiles, joinCtxBlocks, renderCardGrid, renderGeneratedBlock, renderHero, renderSectionHeading } from './utils'

export const agentsMdTarget: TargetAdapter = {
  name: 'agents-md',

  async render(input): Promise<readonly ContextFile[]> {
    const ctxBlocks = getCtxBlocks(input)
    const contextFiles = getContextFiles(input)
    const ordered = ['architecture', 'conventions', 'runtime', 'frontend', 'api', 'database', 'operations', 'data', 'testing', 'workflows', 'glossary'] as const

    const contextLinks = contextFiles.length
      ? contextFiles
        .map((file) => `- ${file.title}: \`.agentctx/context/${file.name}.md\``)
        .join('\n')
      : ordered
        .filter((name) => ctxBlocks.some((block) => block.name === name))
        .map((name) => {
          const block = ctxBlocks.find((candidate) => candidate.name === name)
          const title = block?.title ?? name
          return `- ${title}: \`.agentctx/context/${name}.md\``
        })
        .join('\n')

    const loadOrder = contextFiles
      .filter((file) => ['overview', 'boundaries', 'security', 'architecture', 'commands', 'testing'].includes(file.name))
      .slice(0, 6)
      .map((file, index) => `${index + 1}. \`.agentctx/context/${file.name}.md\``)
      .join('\n')

    const body = [
      renderHero({
        kicker: 'AGENTS.md',
        title: 'Agent Instructions',
        summary: 'Primary operating guide for repo-aware changes in this workspace.',
        chips: ['Deterministic outputs', 'Metadata-first scanning', 'Generated CtxBlocks'],
      }),
      '',
      renderSectionHeading('Snapshot', 'How to read this file quickly'),
      renderCardGrid([
        {
          title: 'Scope',
          summary: 'This file is generated for the current workspace or point scope.',
          bullets: ['Point docs-agentctx at docs-agentctx', 'Point type: docs'],
        },
        {
          title: 'Core files',
          summary: 'The entry points that define the current repo contract.',
          bullets: ['agentctx.config.ts', 'package.json', 'docs-agentctx/package.json'],
        },
        {
          title: 'Rules',
          summary: 'Generated output stays stable and safe by default.',
          bullets: ['Stable ordering', 'No secret values', 'Prefer metadata over full source dumps'],
          accent: true,
        },
      ]),
      '',
      renderSectionHeading('Context map'),
      contextLinks || '_(none generated)_',
      '',
      renderSectionHeading('Recommended Load Order'),
      loadOrder || '1. `.agentctx/context/architecture.md`\n2. `.agentctx/context/conventions.md`\n3. `.agentctx/context/testing.md`',
      '',
      joinCtxBlocks(ctxBlocks, ['architecture', 'conventions', 'testing', 'workflows']),
    ].join('\n')

    return [
      {
        path: 'AGENTS.md',
        generated: true,
        content: renderGeneratedBlock(body),
      },
    ]
  },
}
