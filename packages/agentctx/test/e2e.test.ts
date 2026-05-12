import { cp, readdir, readFile, rm, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "pathe";
import { describe, expect, it } from "vitest";
import { runBuild } from "../src/cli/commands/build.js";
import { runCheck } from "../src/cli/commands/check.js";
import { runInit } from "../src/cli/commands/init.js";

const fixtures = resolve(process.cwd(), "test/fixtures");

describe("AgentCtx e2e", () => {
  it("runs init/build/check on a copied fixture", async () => {
    const cwd = await copyFixture("basic-js");
    try {
      await runInit({ cwd });
      const build = await runBuild({ cwd });
      const check = await runCheck({ cwd });
      expect(build.artifacts.map((artifact) => artifact.path)).toContain(
        ".context/manifest.yaml"
      );
      expect(check.ok).toBe(true);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it("writes expected frontend-api artifacts", async () => {
    const cwd = await copyFixture("frontend-api");
    try {
      await runBuild({ cwd });
      const files = await listGenerated(cwd);
      expect(files).toContain(".context/context-points/web.context.md");
      expect(files).toContain(".context/context-points/api.context.md");
      expect(files).toContain(".context/context-points/contracts.context.md");
      expect(files).toContain("AGENTS.md");
      expect(files).toContain("llms.txt");
      const web = await readFile(
        resolve(cwd, ".context/context-points/web.context.md"),
        "utf8"
      );
      expect(web).toContain("## Start Here");
      expect(web).toContain("## Done When");
      expect(web).toContain("## Evidence");
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});

async function copyFixture(name: string): Promise<string> {
  const cwd = await mkdtemp(resolve(tmpdir(), `agentctx-e2e-${name}-`));
  await cp(resolve(fixtures, name), cwd, { recursive: true });
  return cwd;
}

async function listGenerated(cwd: string): Promise<string[]> {
  const output: string[] = [];
  async function walk(dir: string, prefix = ""): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(resolve(dir, entry.name), rel);
      } else if (rel.startsWith(".context/") || rel === "AGENTS.md" || rel === "llms.txt") {
        output.push(rel);
      }
    }
  }
  await walk(cwd);
  return output.sort();
}
