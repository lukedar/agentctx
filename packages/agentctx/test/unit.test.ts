import { mkdtemp, readFile, rm, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "pathe";
import { describe, expect, it } from "vitest";
import { compileOperationalContext } from "../src/compiler/compile.js";
import { discoverRepository } from "../src/compiler/discover.js";
import { defineConfig } from "../src/config/defineConfig.js";
import { loadConfig } from "../src/config/loadConfig.js";
import { renderContextArtifacts } from "../src/compiler/render.js";
import { checkArtifacts } from "../src/validation/checkArtifacts.js";
import { scoreContextPointContent } from "../src/validation/usefulness.js";
import { estimateTokens } from "../src/utils/tokens.js";
import { isPathInside } from "../src/utils/paths.js";
import { writeArtifacts } from "../src/utils/fs.js";

const fixtures = resolve(process.cwd(), "test/fixtures");

describe("config", () => {
  it("defines and loads config", async () => {
    expect(defineConfig({ surfaces: ["agents-md"] })).toEqual({
      surfaces: ["agents-md"]
    });
    const cwd = await mkdtemp(resolve(tmpdir(), "agentctx-config-"));
    try {
      expect(await loadConfig({ cwd })).toEqual({ surfaces: ["agents-md", "llms-txt"] });
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });
});

describe("utilities", () => {
  it("estimates tokens", () => {
    expect(estimateTokens("12345")).toBe(2);
  });

  it("blocks paths outside the root", () => {
    expect(isPathInside("/tmp/root", "inside/file.txt")).toBe(true);
    expect(isPathInside("/tmp/root", "../outside/file.txt")).toBe(false);
  });
});

describe("discovery and compile", () => {
  it("detects basic-js package evidence", async () => {
    const snapshot = await discoverRepository({ cwd: resolve(fixtures, "basic-js") });
    expect(snapshot.packageJsonFiles[0]?.scripts.test).toBe("vitest run");
    expect(snapshot.detectedLanguages).toContain("TypeScript");
    const context = compileOperationalContext({
      snapshot,
      config: {},
      startedAt: Date.now()
    });
    expect(context.contextPoints.map((point) => point.id)).toEqual(["repository"]);
    expect(context.commands.map((command) => command.command)).toContain("pnpm test");
    expect(context.contextPoints[0]?.detectedFrameworks).toContain("Vitest");
  });

  it("detects frontend-api context points", async () => {
    const snapshot = await discoverRepository({ cwd: resolve(fixtures, "frontend-api") });
    const context = compileOperationalContext({
      snapshot,
      config: {},
      startedAt: Date.now()
    });
    expect(context.contextPoints.map((point) => point.id)).toEqual([
      "api",
      "contracts",
      "web"
    ]);
  });
});

describe("render and validation", () => {
  it("scores useful context", async () => {
    const snapshot = await discoverRepository({ cwd: resolve(fixtures, "basic-js") });
    const context = compileOperationalContext({
      snapshot,
      config: {},
      startedAt: Date.now()
    });
    const artifact = renderContextArtifacts(context).find((item) =>
      item.path.includes("repository.context.md")
    );
    expect(artifact).toBeDefined();
    expect(scoreContextPointContent({ id: "repository", content: artifact?.content ?? "" }).score).toBe(100);
  });

  it("validates written artifacts", async () => {
    const cwd = await copyFixture("frontend-api");
    try {
      const snapshot = await discoverRepository({ cwd });
      const context = compileOperationalContext({
        snapshot,
        config: {},
        startedAt: Date.now()
      });
      await writeArtifacts({
        cwd,
        artifacts: [
          ...renderContextArtifacts(context),
          { path: "AGENTS.md", content: "# AgentCtx\n" },
          { path: "llms.txt", content: "# AgentCtx\n" }
        ]
      });
      const result = await checkArtifacts({ cwd });
      expect(result.ok).toBe(true);
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  });

  it("renders deterministically", async () => {
    const cwd = resolve(fixtures, "frontend-api");
    const first = await renderFixture(cwd);
    const second = await renderFixture(cwd);
    expect(second).toEqual(first);
  });
});

async function renderFixture(cwd: string): Promise<Record<string, string>> {
  const snapshot = await discoverRepository({ cwd });
  const context = compileOperationalContext({
    snapshot,
    config: {},
    startedAt: 1
  });
  return Object.fromEntries(
    renderContextArtifacts(context).map((artifact) => [artifact.path, artifact.content])
  );
}

async function copyFixture(name: string): Promise<string> {
  const cwd = await mkdtemp(resolve(tmpdir(), `agentctx-${name}-`));
  await cp(resolve(fixtures, name), cwd, { recursive: true });
  return cwd;
}
