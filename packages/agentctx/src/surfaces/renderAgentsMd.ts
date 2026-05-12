export function renderAgentsMdSurface(): string {
  return `# AgentCtx

This repository uses AgentCtx operational context.

For coding tasks:

1. Read \`.context/manifest.yaml\`.
2. Load only the Context Point relevant to the task.
3. Read \`.context/repo.context.md\` only for global or cross-cutting work.
4. Do not load every Context Point by default.
5. Use the selected Context Point's Start Here, Commands, Sharp Edges, and Done When sections.
6. Report changed files, checks run, and remaining risks.

Canonical context lives in \`.context/\`.
`;
}
