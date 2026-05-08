import type { ContextBlockName, RenderedContextBlock, TargetRenderInput } from '@agentctx/core'

export const GENERATED_START = '<!-- agentctx:start -->'
export const GENERATED_END = '<!-- agentctx:end -->'

export const renderGeneratedBlock = (content: string): string =>
  [GENERATED_START, content.trimEnd(), GENERATED_END, ''].join('\n')

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

type HeroInput = {
  kicker?: string
  title: string
  summary: string
  chips?: readonly string[]
}

export const renderHero = ({ kicker, title, summary, chips = [] }: HeroInput): string => [
  '<div class="docs-hero">',
  kicker ? `<div class="docs-kicker">${escapeHtml(kicker)}</div>` : '',
  `<h1>${escapeHtml(title)}</h1>`,
  `<p class="docs-lead">${escapeHtml(summary)}</p>`,
  chips.length
    ? `<div class="docs-chip-row">${chips.map((chip) => `<span class="docs-chip">${escapeHtml(chip)}</span>`).join('')}</div>`
    : '',
  '</div>',
]
  .filter(Boolean)
  .join('\n')

type CardInput = {
  title: string
  summary?: string
  bullets?: readonly string[]
  span?: 4 | 6 | 8 | 12
  accent?: boolean
}

export const renderCardGrid = (cards: readonly CardInput[]): string => [
  '<div class="docs-grid">',
  ...cards.map((card) => {
    const classes = [
      'docs-card',
      `docs-span-${card.span ?? 4}`,
      card.accent ? 'docs-card--accent' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const summary = card.summary ? `<p>${escapeHtml(card.summary)}</p>` : ''
    const bullets = card.bullets?.length
      ? `<ul>${card.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>`
      : ''

    return [
      `<div class="${classes}">`,
      `<h3>${escapeHtml(card.title)}</h3>`,
      summary,
      bullets,
      '</div>',
    ]
      .filter(Boolean)
      .join('\n')
  }),
  '</div>',
].join('\n')

export const renderSectionHeading = (title: string, note?: string): string =>
  note
    ? `<div class="docs-section-heading"><h2>${escapeHtml(title)}</h2><span class="docs-note">${escapeHtml(note)}</span></div>`
    : `<h2>${escapeHtml(title)}</h2>`

export const getContextBlocks = (input: TargetRenderInput): readonly RenderedContextBlock[] =>
  input.contextBlocks ?? input.sections ?? []

export const findContextBlock = (
  contextBlocks: readonly RenderedContextBlock[],
  name: ContextBlockName,
): RenderedContextBlock | undefined => contextBlocks.find((block) => block.name === name)

export const renderContextBlockContent = (
  contextBlocks: readonly RenderedContextBlock[],
  name: ContextBlockName,
): string => findContextBlock(contextBlocks, name)?.content.trimEnd() ?? `# ${name}\n\n_(not generated)_\n`

export const joinContextBlocks = (
  contextBlocks: readonly RenderedContextBlock[],
  names: readonly ContextBlockName[],
): string => names.map((name) => renderContextBlockContent(contextBlocks, name)).join('\n\n')

export const findSection = findContextBlock

export const renderSectionContent = renderContextBlockContent

export const joinSections = joinContextBlocks
