export const DEFAULT_SECRET_PATTERNS = [
  '.env',
  '.env.*',
  '*.pem',
  '*.key',
  'id_rsa',
  'id_ed25519',
  'secrets.*',
  '*.p12',
  '*.pfx',
] as const

export const DEFAULT_IGNORE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.cache',
] as const

const DEFAULT_SENSITIVE_VALUE_PATTERNS: readonly RegExp[] = [
  /sk-[a-zA-Z0-9_-]{20,}/,
  /ghp_[a-zA-Z0-9]{20,}/,
  /xox[baprs]-[a-zA-Z0-9-]{20,}/,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
] as const

export const redactSensitiveValue = (value: string): string => {
  const looksSensitive = DEFAULT_SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value))
  return looksSensitive ? '[REDACTED]' : value
}

export type FileFingerprint = Readonly<{
  path: string
  size: number
  mtimeMs: number
  hash: string
}>

export const shouldRescanFile = (
  previous: FileFingerprint | undefined,
  current: FileFingerprint,
): boolean =>
  !previous ||
  previous.size !== current.size ||
  previous.mtimeMs !== current.mtimeMs ||
  previous.hash !== current.hash

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Minimal glob matcher for the runner guardrails.
// Supports: *, ?, **. Paths are treated as forward-slash-separated.
export const globToRegExp = (pattern: string): RegExp => {
  const normalized = pattern.replace(/\\/g, '/')

  // Split on ** first to preserve its meaning across path separators.
  const parts = normalized.split('**').map((p) => {
    const escaped = escapeRegex(p)
    return escaped
      .replace(/\\\*/g, '[^/]*')
      .replace(/\\\?/g, '[^/]')
  })

  const joined = parts.join('.*')
  return new RegExp(`^${joined}$`)
}

export const matchesGlob = (path: string, pattern: string): boolean => {
  const normalized = path.replace(/\\/g, '/')
  return globToRegExp(pattern).test(normalized)
}

export const matchesAnyGlob = (path: string, patterns: readonly string[]): boolean =>
  patterns.some((p) => matchesGlob(path, p))
