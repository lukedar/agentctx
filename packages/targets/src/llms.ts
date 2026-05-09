import type { ContextFile, TargetAdapter } from '@agentctx/core'

import { renderCardGrid, renderGeneratedBlock, renderHero, renderSectionHeading } from './utils'

export const llmsTarget: TargetAdapter = {
  name: 'llms',

  async render(input): Promise<readonly ContextFile[]> {
    const body = [
      renderHero({
        kicker: 'llms.txt',
        title: 'Project index',
        summary: 'Compact generated entry point for language-model consumers.',
        chips: ['Always generated', 'Stable ordering', 'Automatic updates'],
      }),
      '',
      renderSectionHeading('Outputs'),
      renderCardGrid([
        {
          title: 'AGENTS.md',
          summary: 'Primary agent operating guide.',
          span: 6,
        },
        {
          title: 'CLAUDE.md',
          summary: 'Claude project context with the same underlying CtxBlocks.',
          span: 6,
        },
        {
          title: '.cursor/rules/project.mdc',
          summary: 'Editor rules for Cursor.',
          span: 6,
        },
        {
          title: '.github/copilot-instructions.md',
          summary: 'Copilot instructions for the repository.',
          span: 6,
        },
      ]),
      '',
      renderSectionHeading('Notes'),
      '',
      '- Generated automatically.',
      '- Use the linked context files for the full repo schematic.',
    ].join('\n')

    return [
      {
        path: 'llms.txt',
        generated: true,
        content: renderGeneratedBlock(body),
      },
    ]
  },
}
