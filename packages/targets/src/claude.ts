import type { ContextFile, TargetAdapter } from '@agentctx/core'

import { getCtxBlocks, joinCtxBlocks, renderCardGrid, renderGeneratedBlock, renderHero, renderSectionHeading } from './utils'

export const claudeTarget: TargetAdapter = {
  name: 'claude',

  async render(input): Promise<readonly ContextFile[]> {
    const ctxBlocks = getCtxBlocks(input)
    const body = [
      renderHero({
        kicker: 'CLAUDE.md',
        title: 'Claude Project Context',
        summary: 'Structured context for reading the repo like a code schematic.',
        chips: ['Workspace aware', 'Point aware', 'Generated automatically'],
      }),
      '',
      renderSectionHeading('Snapshot', 'What this file covers'),
      renderCardGrid([
        {
          title: 'Architecture',
          summary: 'Package roles, compiler flow, and why the layers are split.',
          span: 6,
        },
        {
          title: 'Frontend / API / DB',
          summary: 'Only the signals detected in this scope are surfaced.',
          span: 6,
        },
        {
          title: 'Testing',
          summary: 'Use the smallest relevant suite first, then broaden only when needed.',
          span: 6,
        },
        {
          title: 'Workflows',
          summary: 'The commands for build, sync, check, and local iteration.',
          span: 6,
        },
      ]),
      '',
      joinCtxBlocks(ctxBlocks, [
        'architecture',
        'runtime',
        'frontend',
        'api',
        'database',
        'operations',
        'data',
        'testing',
        'workflows',
        'glossary',
      ]),
    ].join('\n')

    return [
      {
        path: 'CLAUDE.md',
        generated: true,
        content: renderGeneratedBlock(body),
      },
    ]
  },
}
