import type {
  AgentCtxConfig,
  CommonChangeItem,
  ContextGraph,
  ContextPoint,
  OperationalContext,
  PackageJsonEvidence,
  RepositorySnapshot,
  ValidationCommand
} from "../model/types.js";
import { estimateTokens } from "../utils/tokens.js";

const commandPurposes = new Map<string, string>([
  ["test", "Run tests"],
  ["lint", "Run lint checks"],
  ["typecheck", "Run type checks"],
  ["build", "Build project"],
  ["dev", "Start development server"]
]);

const frameworkByDependency = new Map<string, string>([
  ["react", "React"],
  ["next", "Next.js"],
  ["vite", "Vite"],
  ["express", "Express"],
  ["fastify", "Fastify"],
  ["typescript", "TypeScript"],
  ["vitest", "Vitest"],
  ["jest", "Jest"],
  ["playwright", "Playwright"]
]);

export function compileOperationalContext(input: {
  snapshot: RepositorySnapshot;
  config: AgentCtxConfig;
  startedAt: number;
}): OperationalContext {
  const basePoints = inferContextPoints(input.snapshot, input.config);
  const commands = collectCommands(input.snapshot, basePoints);
  const contextPoints = basePoints.map((point) =>
    enrichContextPoint(point, input.snapshot, commands)
  );
  const graph = buildGraph(contextPoints, commands);
  const generatedCharacters = estimateGeneratedCharacters(contextPoints);

  return {
    repository: {
      name: input.snapshot.repositoryName,
      root: ".",
      primaryLanguages: input.snapshot.detectedLanguages,
      packageManagers: input.snapshot.packageManagers,
      confidence: input.snapshot.files.length > 0 ? "high" : "low"
    },
    contextPoints,
    commands,
    graph,
    metrics: {
      durationMs: Date.now() - input.startedAt,
      filesScanned: input.snapshot.files.length,
      filesSkipped: input.snapshot.filesSkipped,
      contextPointsDiscovered: contextPoints.length,
      artifactsWritten: contextPoints.length + 4,
      generatedCharacters,
      estimatedTokens: estimateTokens("x".repeat(generatedCharacters)),
      largestArtifactPath: contextPoints[0]
        ? `.context/context-points/${contextPoints[0].id}.context.md`
        : ".context/repo.context.md",
      largestArtifactCharacters: 0
    },
    warnings: []
  };
}

function inferContextPoints(
  snapshot: RepositorySnapshot,
  config: AgentCtxConfig
): ContextPoint[] {
  const points = new Map<string, Pick<ContextPoint, "id" | "name" | "type" | "primaryPaths">>();

  for (const configured of config.contextPoints ?? []) {
    points.set(configured.id, {
      id: configured.id,
      name: configured.name ?? titleize(configured.id),
      type: configured.type ?? "configured",
      primaryPaths: configured.primaryPaths
    });
  }

  for (const file of snapshot.files) {
    const inferred = inferFromPath(file.path);
    if (inferred && !points.has(inferred.id)) {
      points.set(inferred.id, inferred);
    }
  }

  if (points.size === 0) {
    points.set("repository", {
      id: "repository",
      name: "Repository",
      type: "repository",
      primaryPaths: ["."]
    });
  }

  return [...points.values()]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((point) => makeContextPoint(point));
}

function inferFromPath(
  path: string
): Pick<ContextPoint, "id" | "name" | "type" | "primaryPaths"> | undefined {
  const parts = path.split("/");
  const [first, second] = parts;
  if (first === "apps" && second) {
    return { id: second, name: titleize(second), type: "application", primaryPaths: [`apps/${second}`] };
  }
  if (first === "services" && second) {
    return { id: second, name: titleize(second), type: "backend-service", primaryPaths: [`services/${second}`] };
  }
  if (first === "workers" && second) {
    return { id: second, name: titleize(second), type: "worker-service", primaryPaths: [`workers/${second}`] };
  }
  if (first === "packages" && second) {
    return { id: second, name: titleize(second), type: "package", primaryPaths: [`packages/${second}`] };
  }
  if (first === "db" || first === "database") {
    return { id: first, name: titleize(first), type: "database-layer", primaryPaths: [first] };
  }
  if (first === "migrations") {
    return { id: "migrations", name: "Migrations", type: "migration-layer", primaryPaths: ["migrations"] };
  }
  if (first === "infra") {
    return { id: "infra", name: "Infrastructure", type: "infrastructure-layer", primaryPaths: ["infra"] };
  }
  if (path.startsWith(".github/workflows/")) {
    return { id: "github-workflows", name: "GitHub Workflows", type: "ci-workflow", primaryPaths: [".github/workflows"] };
  }
  if (first === "docs") {
    return { id: "docs", name: "Docs", type: "documentation-surface", primaryPaths: ["docs"] };
  }
  return undefined;
}

function makeContextPoint(
  base: Pick<ContextPoint, "id" | "name" | "type" | "primaryPaths">
): ContextPoint {
  return {
    ...base,
    relatedPaths: [],
    detectedLanguages: [],
    detectedFrameworks: [],
    riskLevel: "medium",
    confidence: "medium",
    purpose: "",
    owns: [],
    doesNotOwn: [],
    startHere: [],
    commonChanges: [],
    commands: [],
    interfaces: [],
    rules: [],
    securityRules: [],
    sharpEdges: [],
    unknowns: [],
    evidence: []
  };
}

function collectCommands(
  snapshot: RepositorySnapshot,
  points: ContextPoint[]
): ValidationCommand[] {
  const commands: ValidationCommand[] = [];
  for (const pkg of snapshot.packageJsonFiles) {
    const contextPointId = findOwningPoint(pkg.path, points)?.id ?? "global";
    for (const [scriptName, purpose] of commandPurposes) {
      if (!pkg.scripts[scriptName]) {
        continue;
      }
      const prefix = pkg.path === "package.json" ? "pnpm" : `pnpm --dir ${pkg.path.replace(/\/package\.json$/, "")}`;
      commands.push({
        id: `${contextPointId}-${scriptName}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
        contextPointId,
        command: `${prefix} ${scriptName}`,
        purpose,
        evidence: pkg.path
      });
    }
  }
  return commands.sort((a, b) => a.id.localeCompare(b.id));
}

function enrichContextPoint(
  point: ContextPoint,
  snapshot: RepositorySnapshot,
  commands: ValidationCommand[]
): ContextPoint {
  const pointFiles = snapshot.files
    .map((file) => file.path)
    .filter((path) => isWithinAny(path, point.primaryPaths))
    .sort((a, b) => a.localeCompare(b));
  const packages = snapshot.packageJsonFiles.filter((pkg) =>
    isWithinAny(pkg.path, point.primaryPaths)
  );
  const dependencies = new Set(packages.flatMap((pkg) => [...pkg.dependencies, ...pkg.devDependencies]));
  const frameworks = [...dependencies]
    .map((dep) => frameworkByDependency.get(dep))
    .filter((item): item is string => Boolean(item))
    .sort((a, b) => a.localeCompare(b));
  const attachedCommands = commands.filter((command) => command.contextPointId === point.id);
  const firstPaths = pointFiles.slice(0, 3);
  const commandsOrUnknowns =
    attachedCommands.length > 0
      ? []
      : ["No validation command was detected directly under this Context Point."];

  return {
    ...point,
    relatedPaths: firstPaths.filter((path) => !point.primaryPaths.includes(path)),
    detectedLanguages: snapshot.detectedLanguages,
    detectedFrameworks: frameworks,
    riskLevel: point.type.includes("service") || point.type.includes("database") ? "high" : "medium",
    confidence: pointFiles.length > 0 || point.primaryPaths.includes(".") ? "high" : "medium",
    purpose: `${point.name} groups operational context for ${point.primaryPaths.join(", ")}.`,
    owns: point.primaryPaths,
    doesNotOwn: ["Unrelated repository areas outside the listed primary paths."],
    startHere: (firstPaths.length > 0 ? firstPaths : point.primaryPaths).map((path) => ({
      path,
      why: "Representative entry point or metadata for this area.",
      commonTask: "Inspect before making changes in this Context Point."
    })),
    commonChanges: buildCommonChanges(point, attachedCommands),
    commands: attachedCommands,
    rules: [
      "Prefer existing local patterns before introducing new abstractions.",
      "Keep changes scoped to the Context Point unless an interface requires wider edits."
    ],
    securityRules: [
      "Do not copy secrets into generated context.",
      "Review configuration and environment handling before changing runtime behavior."
    ],
    sharpEdges: [
      "Generated context is a guide, not a replacement for inspecting current source.",
      "Validation commands may be incomplete when package scripts are missing."
    ],
    unknowns: commandsOrUnknowns,
    evidence: [
      {
        claim: `${point.name} is represented by ${point.primaryPaths.join(", ")}.`,
        evidence: pointFiles.length > 0 ? firstPaths : point.primaryPaths,
        confidence: pointFiles.length > 0 ? "evidence-backed" : "inferred"
      }
    ]
  };
}

function buildCommonChanges(
  point: ContextPoint,
  commands: ValidationCommand[]
): CommonChangeItem[] {
  return [
    {
      changeType: "Behavior change",
      inspectFirst: point.primaryPaths,
      likelyEditLocations: point.primaryPaths,
      requiredChecks: commands.map((command) => command.command),
      risk: point.riskLevel
    }
  ];
}

function buildGraph(points: ContextPoint[], commands: ValidationCommand[]): ContextGraph {
  return {
    version: 1,
    artifact: "agentCtx_graph",
    nodes: points.map((point) => ({
      id: point.id,
      name: point.name,
      type: point.type,
      primary_paths: [...point.primaryPaths].sort(),
      related_paths: [...point.relatedPaths].sort(),
      languages: [...point.detectedLanguages].sort(),
      frameworks: [...point.detectedFrameworks].sort(),
      artifact: `.context/context-points/${point.id}.context.md`,
      risk_level: point.riskLevel,
      confidence: point.confidence
    })),
    edges: [],
    commands: commands.map((command) => ({
      id: command.id,
      context_point: command.contextPointId,
      command: command.command,
      purpose: command.purpose,
      evidence: command.evidence
    }))
  };
}

function findOwningPoint(path: string, points: ContextPoint[]): ContextPoint | undefined {
  return points.find((point) => isWithinAny(path, point.primaryPaths));
}

function isWithinAny(path: string, primaryPaths: string[]): boolean {
  return primaryPaths.some((primaryPath) => {
    if (primaryPath === ".") {
      return true;
    }
    return path === primaryPath || path.startsWith(`${primaryPath}/`);
  });
}

function titleize(value: string): string {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function estimateGeneratedCharacters(points: ContextPoint[]): number {
  return points.length * 3000 + 4000;
}
