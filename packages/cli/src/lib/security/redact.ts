const SECRET_PATTERNS: readonly RegExp[] = [
  /sk-[A-Za-z0-9_-]{20,}/g,
  /ghp_[A-Za-z0-9_]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{20,}/g,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g,
]

export const redactSecrets = (text: string): string =>
  SECRET_PATTERNS.reduce((safe, pattern) => safe.replace(pattern, '[REDACTED_SECRET]'), text)

export const hasPotentialSecrets = (text: string): boolean =>
  SECRET_PATTERNS.some((pattern) => pattern.test(text))
