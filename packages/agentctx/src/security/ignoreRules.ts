export const ignorePatterns = [
  "node_modules/**",
  ".git/**",
  "dist/**",
  "build/**",
  "coverage/**",
  ".next/**",
  ".context/**",
  "docs/.vitepress/**",
  ".env*",
  "*.lock",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock"
];

export const secretPatterns = [
  /AKIA[0-9A-Z]{16}/,
  /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["']?[A-Za-z0-9_\-]{20,}/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];
