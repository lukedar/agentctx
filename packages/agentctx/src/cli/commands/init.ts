import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve } from "pathe";

export type InitOptions = {
  cwd: string;
  force?: boolean;
  dryRun?: boolean;
};

export async function runInit(options: InitOptions): Promise<{ created: string[] }> {
  const configPath = resolve(options.cwd, "agentctx.config.ts");
  if (existsSync(configPath) && !options.force) {
    throw Object.assign(new Error("agentctx.config.ts already exists"), {
      exitCode: 1,
      code: "CONFIG_EXISTS"
    });
  }

  if (!options.dryRun) {
    await writeFile(
      configPath,
      `import { defineConfig } from "agentctx";

export default defineConfig({
  surfaces: ["agents-md", "llms-txt"]
});
`,
      "utf8"
    );
  }

  return { created: ["agentctx.config.ts"] };
}

export function renderInitSuccess(): string {
  return `AgentCtx initialized

Created:
- agentctx.config.ts

Next:
- Run \`agentctx build\`
- Run \`agentctx check\`
`;
}
