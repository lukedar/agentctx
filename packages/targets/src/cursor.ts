import type { ContextFile, TargetAdapter } from '@agentctx/core'

import { renderGeneratedBlock } from './utils'

export const cursorTarget: TargetAdapter = {
  name: 'cursor',

  async render(input): Promise<readonly ContextFile[]> {
    const rules = [
      '# Project coding rules',
      '',
      '## Shape',
      '',
      '- Prefer existing package boundaries.',
      '- Keep changes deterministic and reviewable.',
      '- Do not include secrets or `.env` values in generated context.',
      '',
      '## Validation',
      '',
      '- Run typecheck and tests before finalizing changes.',
      '- Keep diffs small enough to review in one pass.',
    ]

    const body = [
      '---',
      'description: Project-wide coding rules',
      'globs: ["**/*.{ts,tsx,js,jsx}"]',
      'alwaysApply: true',
      '---',
      '',
      renderGeneratedBlock(rules.join('\n')),
    ].join('\n')

    return [
      {
        path: '.cursor/rules/project.mdc',
        generated: true,
        content: body,
      },
    ]
  },
}
