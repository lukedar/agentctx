import type { ContextFile, TargetAdapter } from '@agentctx/core'

import { getContextBlocks, joinContextBlocks, renderCardGrid, renderGeneratedBlock, renderHero, renderSectionHeading } from './utils'

export const agentsMdTarget: TargetAdapter = {
  name: 'agents-md',

  async render(input): Promise<readonly ContextFile[]> {
    const contextBlocks = getContextBlocks(input)
    const ordered = ['architecture', 'conventions', 'runtime', 'frontend', 'api', 'database', 'testing', 'workflows', 'glossary'] as const

    const contextBlockNames = ordered.filter((name) => contextBlocks.some((block) => block.name === name))

    const links = contextBlockNames
      .map((name) => {
        const block = contextBlocks.find((candidate) => candidate.name === name)
        const title = block?.title ?? name
        return `- ${title}: \`.agentctx/context/${name}.md\``
      })
      .join('\n')

    const body = [
      renderHero({
        kicker: 'AGENTS.md',
        title: 'Agent Instructions',
        summary: 'Primary operating guide for repo-aware changes in this workspace.',
        chips: ['Deterministic outputs', 'Metadata-first scanning', 'Generated context blocks'],
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
      links || '_(none generated)_',
      '',
      renderSectionHeading('Reading order'),
      renderCardGrid([
        {
          title: '1. Architecture',
          summary: 'Understand the compiler pipeline and package boundaries first.',
          span: 6,
        },
        {
          title: '2. Conventions',
          summary: 'Check the rules that govern generated outputs and diffs.',
          span: 6,
        },
        {
          title: '3. Testing',
          summary: 'Use the smallest relevant test suite before finalizing changes.',
          span: 6,
        },
        {
          title: '4. Workflows',
          summary: 'Run build, sync, and check through the documented commands.',
          span: 6,
        },
      ]),
      '',
      joinContextBlocks(contextBlocks, ['architecture', 'conventions', 'testing', 'workflows']),
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
