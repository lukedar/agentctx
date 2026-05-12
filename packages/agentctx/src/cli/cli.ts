#!/usr/bin/env node
import { cac } from "cac";
import { resolve } from "pathe";
import { runBuild, renderBuildSuccess } from "./commands/build.js";
import { runCheck, renderCheckSuccess } from "./commands/check.js";
import { runInit, renderInitSuccess } from "./commands/init.js";

type CliError = Error & { exitCode?: number; code?: string; details?: unknown };

const cli = cac("agentctx");

cli
  .command("init", "Create agentctx.config.ts")
  .option("--cwd <path>", "Working directory")
  .option("--force", "Overwrite existing config")
  .option("--dry-run", "Do not write files")
  .option("--json", "Print JSON")
  .action(async (options) => {
    await handle("init", Boolean(options.json), async () => {
      const data = await runInit({
        cwd: resolve(String(options.cwd ?? process.cwd())),
        force: Boolean(options.force),
        dryRun: Boolean(options.dryRun)
      });
      return { data, text: renderInitSuccess(), warnings: [] };
    });
  });

cli
  .command("build", "Build AgentCtx artifacts")
  .option("--cwd <path>", "Working directory")
  .option("--dry-run", "Do not write files")
  .option("--json", "Print JSON")
  .action(async (options) => {
    await handle("build", Boolean(options.json), async () => {
      const data = await runBuild({
        cwd: resolve(String(options.cwd ?? process.cwd())),
        dryRun: Boolean(options.dryRun)
      });
      return {
        data: {
          artifacts: data.artifacts.map((artifact) => artifact.path),
          metrics: data.context.metrics,
          contextPoints: data.context.contextPoints.map((point) => point.id)
        },
        text: renderBuildSuccess(data),
        warnings: data.context.warnings
      };
    });
  });

cli
  .command("check", "Validate generated AgentCtx artifacts")
  .option("--cwd <path>", "Working directory")
  .option("--json", "Print JSON")
  .action(async (options) => {
    await handle("check", Boolean(options.json), async () => {
      const data = await runCheck({ cwd: resolve(String(options.cwd ?? process.cwd())) });
      if (!data.ok) {
        throw Object.assign(new Error(data.errors.join("; ")), {
          exitCode: 1,
          code: "CHECK_FAILED",
          details: data
        });
      }
      return { data, text: renderCheckSuccess(data), warnings: data.warnings };
    });
  });

cli.help();
cli.parse();

async function handle<T>(
  command: string,
  json: boolean,
  fn: () => Promise<{ data: T; text: string; warnings: string[] }>
): Promise<void> {
  try {
    const result = await fn();
    if (json) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            command,
            data: result.data,
            warnings: result.warnings
          },
          null,
          2
        )
      );
    } else {
      console.log(result.text);
    }
  } catch (error) {
    const cliError = error as CliError;
    const exitCode = cliError.exitCode ?? 4;
    if (json) {
      console.log(
        JSON.stringify(
          {
            ok: false,
            command,
            error: {
              code: cliError.code ?? "INTERNAL_ERROR",
              message: cliError.message,
              details: cliError.details
            },
            warnings: []
          },
          null,
          2
        )
      );
    } else {
      console.error(cliError.message);
    }
    process.exitCode = exitCode;
  }
}
