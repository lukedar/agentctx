export function renderLlmsTxtSurface(): string {
  return `# AgentCtx

This repository exposes operational context for LLMs and coding agents.

Start here:

- \`.context/manifest.yaml\`
- \`.context/repo.context.md\`
- \`.context/context-points/\`

Loading rule: read the manifest first, then load only the relevant Context Point. Do not load every context file by default.
`;
}
