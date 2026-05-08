export const GENERATED_START = '<!-- agentctx:start -->'
export const GENERATED_END = '<!-- agentctx:end -->'

export const hasGeneratedBlock = (text: string): boolean =>
  text.includes(GENERATED_START) && text.includes(GENERATED_END)

export const extractGeneratedBlock = (text: string): string | undefined => {
  const start = text.indexOf(GENERATED_START)
  const end = text.indexOf(GENERATED_END)
  if (start === -1 || end === -1 || end < start) return undefined

  return text.slice(start, end + GENERATED_END.length) + '\n'
}

export const replaceGeneratedBlock = (existing: string, nextBlock: string): string => {
  const start = existing.indexOf(GENERATED_START)
  const end = existing.indexOf(GENERATED_END)
  if (start === -1 || end === -1 || end < start) return existing

  const before = existing.slice(0, start)
  const after = existing.slice(end + GENERATED_END.length)

  return `${before}${nextBlock.trimEnd()}${after}`
}

export const mergeGeneratedContent = (existing: string | undefined, generated: string): string => {
  if (!existing) return generated

  if (hasGeneratedBlock(existing)) {
    const block = extractGeneratedBlock(generated) ?? generated
    return replaceGeneratedBlock(existing, block)
  }

  const sep = existing.endsWith('\n') ? '\n' : '\n\n'
  return `${existing}${sep}${generated}`
}
