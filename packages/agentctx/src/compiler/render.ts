import type { ContextArtifact, ContextPoint, OperationalContext } from "../model/types.js";
import { stableJson } from "../utils/json.js";
import { artifactPathForContextPoint } from "../utils/paths.js";

export function renderContextArtifacts(context: OperationalContext): ContextArtifact[] {
  const contextPoints = [...context.contextPoints].sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  return [
    { path: ".context/manifest.yaml", content: renderManifest(context, contextPoints) },
    { path: ".context/graph.json", content: stableJson(context.graph) },
    { path: ".context/repo.context.md", content: renderRepoContext(context) },
    ...contextPoints.map((point) => ({
      path: artifactPathForContextPoint(point.id),
      content: renderContextPoint(point)
    })),
    {
      path: ".context/templates/task-packet.schema.md",
      content: renderTaskPacketSchema()
    }
  ];
}

function renderManifest(
  context: OperationalContext,
  contextPoints: ContextPoint[]
): string {
  return [
    "version: 1",
    "artifact: agentCtx_manifest",
    "generated_at: unknown",
    "repository:",
    `  name: ${yaml(context.repository.name)}`,
    "  root: .",
    "  primary_languages:",
    ...list(context.repository.primaryLanguages, 4),
    "  package_managers:",
    ...list(context.repository.packageManagers, 4),
    `  confidence: ${context.repository.confidence}`,
    "",
    "loading_strategy:",
    "  default: progressive_disclosure",
    "  description: Load repo context first, then only the context points relevant to the task.",
    "",
    "global_context:",
    "  path: .context/repo.context.md",
    "",
    "graph:",
    "  path: .context/graph.json",
    "",
    "context_points:",
    ...contextPoints.flatMap((point) => [
      `  - id: ${yaml(point.id)}`,
      `    name: ${yaml(point.name)}`,
      `    type: ${yaml(point.type)}`,
      `    path: ${artifactPathForContextPoint(point.id)}`,
      "    primary_paths:",
      ...list(point.primaryPaths, 6),
      "    load_when:",
      ...list(point.primaryPaths.map((path) => `Tasks touching ${path}`), 6),
      `    risk_level: ${point.riskLevel}`,
      `    confidence: ${point.confidence}`
    ]),
    ""
  ].join("\n");
}

function renderRepoContext(context: OperationalContext): string {
  return [
    "---",
    "artifact: agentCtx_repo_context",
    "version: 1",
    "generated_at: unknown",
    `confidence: ${context.repository.confidence}`,
    "---",
    "",
    "# Repository Context",
    "",
    "## Purpose",
    "",
    `AgentCtx operational context for ${context.repository.name}.`,
    "",
    "## Repository Shape",
    "",
    table(
      ["Context Point", "Type", "Primary Paths"],
      context.contextPoints.map((point) => [
        point.name,
        point.type,
        point.primaryPaths.join(", ")
      ])
    ),
    "",
    "## Global Coding Rules",
    "",
    "- Prefer existing local patterns.",
    "- Keep generated context deterministic.",
    "- Load only task-relevant Context Points.",
    "",
    "## Package, Build, and Tooling",
    "",
    context.commands.length > 0
      ? context.commands.map((command) => `- \`${command.command}\` - ${command.purpose}`).join("\n")
      : "- No validation commands detected.",
    "",
    "## Global Validation Strategy",
    "",
    "- Run targeted checks first.",
    "- Run broader checks when shared boundaries change.",
    "",
    "## Cross-Cutting Boundaries",
    "",
    "- Use the graph artifact for Context Point boundaries.",
    "",
    "## Cross-Cutting Security Rules",
    "",
    "- Do not expose secrets in generated artifacts.",
    "- Treat environment and credential paths as sensitive.",
    "",
    "## Generated Code Policy",
    "",
    "- Regenerate context with `agentctx build`.",
    "",
    "## High-Risk Global Areas",
    "",
    "- Package scripts, CI workflows, generated artifacts, and shared contracts.",
    "",
    "## Context Loading Guidance",
    "",
    "- Read `.context/manifest.yaml` first.",
    "- Load only the relevant Context Point for the task.",
    "",
    "## Evidence",
    "",
    `- Files scanned: ${context.metrics.filesScanned}`,
    `- Context Points discovered: ${context.metrics.contextPointsDiscovered}`,
    "",
    "## Unknowns",
    "",
    context.commands.length > 0 ? "- None." : "- Validation commands were not detected.",
    ""
  ].join("\n");
}

function renderContextPoint(point: ContextPoint): string {
  const commands =
    point.commands.length > 0
      ? point.commands.map((command) => command.command).join("\n")
      : "# Unknown: no validation command detected for this Context Point.";

  return [
    "---",
    "artifact: agentCtx_context_point",
    `id: ${point.id}`,
    `name: ${point.name}`,
    "version: 1",
    "generated_at: unknown",
    "primary_paths:",
    ...list(point.primaryPaths, 2),
    `related_paths: ${point.relatedPaths.length === 0 ? "[]" : ""}`,
    ...(point.relatedPaths.length > 0 ? list(point.relatedPaths, 2) : []),
    "detected_languages:",
    ...list(point.detectedLanguages, 2),
    "detected_frameworks:",
    ...list(point.detectedFrameworks, 2),
    `risk_level: ${point.riskLevel}`,
    `confidence: ${point.confidence}`,
    "---",
    "",
    `# Context Point: ${point.name}`,
    "",
    "## Purpose",
    "",
    point.purpose,
    "",
    "## Scope",
    "",
    "### Owns",
    "",
    bullets(point.owns),
    "",
    "### Does Not Own",
    "",
    bullets(point.doesNotOwn),
    "",
    "## Start Here",
    "",
    table(
      ["Path", "Why It Matters", "Common Task"],
      point.startHere.map((item) => [item.path, item.why, item.commonTask])
    ),
    "",
    "## Coding Flow",
    "",
    "- Inspect the nearest existing implementation first.",
    "- Make the smallest scoped change.",
    "- Run the listed commands or report why they are unavailable.",
    "",
    "## Interfaces",
    "",
    table(
      ["Interface", "Connected Context Point", "Direction", "Breakage Risk", "Evidence"],
      point.interfaces.map((item) => [
        item.name,
        item.connectedContextPointId,
        item.direction,
        item.breakageRisk,
        item.evidence.join(", ")
      ])
    ),
    "",
    "## Common Code Changes",
    "",
    table(
      ["Change Type", "Inspect First", "Likely Edit Locations", "Required Tests/Checks", "Risk"],
      point.commonChanges.map((item) => [
        item.changeType,
        item.inspectFirst.join(", "),
        item.likelyEditLocations.join(", "),
        item.requiredChecks.length > 0 ? item.requiredChecks.join(", ") : "Unknown",
        item.risk
      ])
    ),
    "",
    "## Commands",
    "",
    "```bash",
    commands,
    "```",
    "",
    "## Patterns to Follow",
    "",
    "- Match nearby code organization and naming.",
    "",
    "## Rules and Constraints",
    "",
    bullets(point.rules),
    "",
    "## Security-Relevant Rules",
    "",
    bullets(point.securityRules),
    "",
    "## Sharp Edges",
    "",
    bullets(point.sharpEdges),
    "",
    "## Change Protocol",
    "",
    "1. Inspect the nearest existing implementation or test.",
    "2. Identify affected interfaces and consumers.",
    "3. Make the smallest correct change.",
    "4. Update tests, generated artifacts, schemas, docs, or fixtures if required.",
    "5. Run targeted checks first.",
    "6. Run broader checks if shared boundaries changed.",
    "7. Report changed files, validation results, and residual risk.",
    "",
    "## Done When",
    "",
    "- The requested behavior is implemented.",
    "- Relevant tests or checks pass, or missing checks are reported.",
    "- Interfaces remain compatible or consumers are updated.",
    "- Generated artifacts are updated through the repo-approved process, if applicable.",
    "- Final handoff names changed files, checks run, and remaining risks.",
    "",
    "## Evidence",
    "",
    table(
      ["Claim", "Repository Evidence"],
      point.evidence.map((claim) => [claim.claim, claim.evidence.join(", ")])
    ),
    "",
    "## Unknowns",
    "",
    bullets(point.unknowns.length > 0 ? point.unknowns : ["None."]),
    "",
    "## Refresh Triggers",
    "",
    "- primary paths move",
    "- validation commands change",
    "- tests move",
    "- dependency boundaries change",
    "- generated-code process changes",
    ""
  ].join("\n");
}

function renderTaskPacketSchema(): string {
  return [
    "# Task Packet Schema",
    "",
    "Use this shape when handing task-specific context to a coding agent.",
    "",
    "```yaml",
    "task:",
    "  summary: string",
    "  context_points:",
    "    - id: string",
    "      path: string",
    "  validation:",
    "    commands:",
    "      - string",
    "  risks:",
    "    - string",
    "```",
    ""
  ].join("\n");
}

function table(headers: string[], rows: string[][]): string {
  const safeRows = rows.length > 0 ? rows : [headers.map(() => "None")];
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...safeRows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`)
  ].join("\n");
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|");
}

function list(values: string[], indent: number): string[] {
  if (values.length === 0) {
    return [`${" ".repeat(indent)}- unknown`];
  }
  return [...values].sort((a, b) => a.localeCompare(b)).map((value) => `${" ".repeat(indent)}- ${yaml(value)}`);
}

function bullets(values: string[]): string {
  return values.map((value) => `- ${value}`).join("\n");
}

function yaml(value: string): string {
  if (/^[a-zA-Z0-9_./ -]+$/.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}
