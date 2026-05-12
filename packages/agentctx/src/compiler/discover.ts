import { stat, readFile } from "node:fs/promises";
import fg from "fast-glob";
import { basename } from "pathe";
import type {
  EvidenceRef,
  PackageJsonEvidence,
  RepositoryFile,
  RepositorySnapshot
} from "../model/types.js";
import { ignorePatterns } from "../security/ignoreRules.js";
import { normalizeRepoPath } from "../utils/paths.js";

const inspectPatterns = [
  "package.json",
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  ".github/copilot-instructions.md",
  ".cursor/rules/**",
  ".github/workflows/**",
  "tsconfig.json",
  "vite.config.*",
  "next.config.*",
  "src/**",
  "apps/**",
  "services/**",
  "packages/**",
  "workers/**",
  "db/**",
  "database/**",
  "migrations/**",
  "infra/**",
  "tests/**",
  "test/**",
  "docs/**"
];

const languageByExtension = new Map<string, string>([
  [".ts", "TypeScript"],
  [".tsx", "TypeScript"],
  [".js", "JavaScript"],
  [".jsx", "JavaScript"],
  [".mjs", "JavaScript"],
  [".cjs", "JavaScript"],
  [".json", "JSON"],
  [".md", "Markdown"],
  [".css", "CSS"],
  [".html", "HTML"],
  [".py", "Python"],
  [".go", "Go"],
  [".rs", "Rust"]
]);

export async function discoverRepository(input: {
  cwd: string;
}): Promise<RepositorySnapshot> {
  const paths = (
    await fg(inspectPatterns, {
      cwd: input.cwd,
      dot: true,
      ignore: ignorePatterns,
      onlyFiles: true,
      unique: true
    })
  )
    .map(normalizeRepoPath)
    .sort((a, b) => a.localeCompare(b));

  const files: RepositoryFile[] = [];
  const packageJsonFiles: PackageJsonEvidence[] = [];
  const readmeFiles: EvidenceRef[] = [];
  const agentInstructionFiles: EvidenceRef[] = [];
  const ciFiles: EvidenceRef[] = [];
  const languages = new Set<string>();
  const packageManagers = new Set<string>();
  let filesSkipped = 0;

  for (const path of paths) {
    const fileStat = await stat(`${input.cwd}/${path}`);
    if (fileStat.size > 200_000) {
      filesSkipped += 1;
      continue;
    }
    files.push({ path, kind: "file", sizeBytes: fileStat.size });

    const ext = extensionOf(path);
    const language = languageByExtension.get(ext);
    if (language) {
      languages.add(language);
    }

    if (path.endsWith("package.json")) {
      const pkg = await readPackageJson(input.cwd, path);
      packageJsonFiles.push(pkg);
      if (pkg.devDependencies.includes("typescript") || pkg.dependencies.includes("typescript")) {
        languages.add("TypeScript");
      }
      packageManagers.add("pnpm");
    } else if (basename(path).toLowerCase() === "readme.md") {
      readmeFiles.push({ path, confidence: "evidence-backed" });
    } else if (
      path === "AGENTS.md" ||
      path === "CLAUDE.md" ||
      path === ".github/copilot-instructions.md" ||
      path.startsWith(".cursor/rules/")
    ) {
      await readSmallMetadata(input.cwd, path);
      agentInstructionFiles.push({ path, confidence: "evidence-backed" });
    } else if (path.startsWith(".github/workflows/")) {
      ciFiles.push({ path, confidence: "evidence-backed" });
    }
  }

  const rootPackage = packageJsonFiles.find((file) => file.path === "package.json");
  return {
    root: input.cwd,
    repositoryName: rootPackage?.name ?? basename(input.cwd),
    files,
    packageJsonFiles,
    readmeFiles,
    agentInstructionFiles,
    ciFiles,
    detectedLanguages: [...languages].sort((a, b) => a.localeCompare(b)),
    packageManagers: [...packageManagers].sort((a, b) => a.localeCompare(b)),
    filesSkipped
  };
}

async function readPackageJson(
  cwd: string,
  path: string
): Promise<PackageJsonEvidence> {
  const content = await readFile(`${cwd}/${path}`, "utf8");
  const parsed = JSON.parse(content) as {
    name?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  return {
    path,
    ...(parsed.name === undefined ? {} : { name: parsed.name }),
    scripts: parsed.scripts ?? {},
    dependencies: Object.keys(parsed.dependencies ?? {}).sort(),
    devDependencies: Object.keys(parsed.devDependencies ?? {}).sort()
  };
}

async function readSmallMetadata(cwd: string, path: string): Promise<string> {
  const content = await readFile(`${cwd}/${path}`, "utf8");
  return content.slice(0, 20_000);
}

function extensionOf(path: string): string {
  const match = /\.[^.\/]+$/.exec(path);
  return match?.[0] ?? "";
}
