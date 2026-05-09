import type { ContextFile, TargetAdapter } from '@agentctx/core'

import { getCtxBlocks, joinCtxBlocks, renderCardGrid, renderGeneratedBlock, renderHero, renderSectionHeading } from './utils'

export const copilotTarget: TargetAdapter = {
  name: 'copilot',

  async render(input): Promise<readonly ContextFile[]> {
    const ctxBlocks = getCtxBlocks(input)
    const body = [
      renderHero({
        kicker: 'Copilot',
        title: 'Copilot instructions',
        summary: 'Compact coding rules for editor-assist workflows in this repository.',
        chips: ['Deterministic', 'Reviewable', 'Safe by default'],
      }),
      '',
      renderSectionHeading('Rules at a glance'),
      renderCardGrid([
        {
          title: 'Boundaries',
          summary: 'Prefer existing package boundaries and avoid cross-layer leakage.',
        },
        {
          title: 'Outputs',
          summary: 'Keep generated output deterministic and stable across runs.',
        },
        {
          title: 'Validation',
          summary: 'Run typecheck and tests before finalizing changes.',
        },
      ]),
      '',
      joinCtxBlocks(ctxBlocks, ['conventions', 'testing', 'workflows']),
    ].join('\n')

    return [
      {
        path: '.github/copilot-instructions.md',
        generated: true,
        content: renderGeneratedBlock(body),
      },
    ]
  },
}
