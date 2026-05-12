import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "pathe";
import type { AgentCtxConfig, ConfigContextPoint } from "../model/types.js";
import { agentCtxConfigSchema } from "./schema.js";

export async function loadConfig(input: { cwd: string }): Promise<AgentCtxConfig> {
  const configPath = resolve(input.cwd, "agentctx.config.ts");
  if (!existsSync(configPath)) {
    return { surfaces: ["agents-md", "llms-txt"] };
  }

  const source = await readFile(configPath, "utf8");
  const expression = source
    .replace(/import\s+\{\s*defineConfig\s*\}\s+from\s+["']agentctx["'];?/g, "")
    .replace(/export\s+default\s+defineConfig\s*\(/, "return defineConfig(")
    .replace(/;\s*$/g, "");

  const defineConfig = (config: unknown) => config;
  const parsed = Function("defineConfig", expression)(defineConfig) as unknown;
  return normalizeConfig(agentCtxConfigSchema.parse(parsed ?? {}));
}

function normalizeConfig(config: {
  contextPoints?: {
    id: string;
    name?: string | undefined;
    type?: string | undefined;
    primaryPaths: string[];
  }[] | undefined;
  surfaces?: ("agents-md" | "llms-txt")[] | undefined;
}): AgentCtxConfig {
  return {
    ...(config.contextPoints === undefined
      ? {}
      : {
          contextPoints: config.contextPoints.map(
            (point): ConfigContextPoint => ({
              id: point.id,
              ...(point.name === undefined ? {} : { name: point.name }),
              ...(point.type === undefined ? {} : { type: point.type }),
              primaryPaths: point.primaryPaths
            })
          )
        }),
    ...(config.surfaces === undefined ? {} : { surfaces: config.surfaces })
  };
}
