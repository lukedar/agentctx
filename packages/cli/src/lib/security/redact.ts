const SECRET_PATTERNS: readonly RegExp[] = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /ghp_[A-Za-z0-9_]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{20,}/g,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g,
]

// Clone global regexes before use so repeated detection calls do not leak `lastIndex` state.
const clonePattern = (pattern: RegExp, stripGlobal = false): RegExp =>
  new RegExp(pattern.source, stripGlobal ? pattern.flags.replaceAll('g', '') : pattern.flags)

export const redactSecrets = (text: string): string =>
  SECRET_PATTERNS.reduce((safe, pattern) => safe.replace(clonePattern(pattern), '[REDACTED_SECRET]'), text)

export const hasPotentialSecrets = (text: string): boolean =>
  SECRET_PATTERNS.some((pattern) => clonePattern(pattern, true).test(text))
