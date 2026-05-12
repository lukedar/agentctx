export type AgentCtxConfig = {
  contextPoints?: ConfigContextPoint[];
  surfaces?: ContextSurfaceKind[];
};

export type ConfigContextPoint = {
  id: string;
  name?: string;
  type?: string;
  primaryPaths: string[];
};

export type ContextSurfaceKind = "agents-md" | "llms-txt";

export type RepositorySnapshot = {
  root: string;
  repositoryName: string;
  files: RepositoryFile[];
  packageJsonFiles: PackageJsonEvidence[];
  readmeFiles: EvidenceRef[];
  agentInstructionFiles: EvidenceRef[];
  ciFiles: EvidenceRef[];
  detectedLanguages: string[];
  packageManagers: string[];
  filesSkipped: number;
};

export type RepositoryFile = {
  path: string;
  kind: "file" | "directory";
  sizeBytes?: number;
};

export type PackageJsonEvidence = {
  path: string;
  name?: string;
  scripts: Record<string, string>;
  dependencies: string[];
  devDependencies: string[];
};

export type EvidenceRef = {
  path: string;
  confidence: "evidence-backed" | "inferred" | "unknown";
};

export type OperationalContext = {
  repository: RepositorySummary;
  contextPoints: ContextPoint[];
  commands: ValidationCommand[];
  graph: ContextGraph;
  metrics: BuildMetrics;
  warnings: string[];
};

export type RepositorySummary = {
  name: string;
  root: string;
  primaryLanguages: string[];
  packageManagers: string[];
  confidence: "low" | "medium" | "high";
};

export type ContextPoint = {
  id: string;
  name: string;
  type: string;
  primaryPaths: string[];
  relatedPaths: string[];
  detectedLanguages: string[];
  detectedFrameworks: string[];
  riskLevel: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  purpose: string;
  owns: string[];
  doesNotOwn: string[];
  startHere: StartHereItem[];
  commonChanges: CommonChangeItem[];
  commands: ValidationCommand[];
  interfaces: InterfaceItem[];
  rules: string[];
  securityRules: string[];
  sharpEdges: string[];
  unknowns: string[];
  evidence: EvidenceClaim[];
};

export type StartHereItem = {
  path: string;
  why: string;
  commonTask: string;
};

export type CommonChangeItem = {
  changeType: string;
  inspectFirst: string[];
  likelyEditLocations: string[];
  requiredChecks: string[];
  risk: "low" | "medium" | "high";
};

export type ValidationCommand = {
  id: string;
  contextPointId: string | "global";
  command: string;
  purpose: string;
  evidence: string;
};

export type InterfaceItem = {
  name: string;
  connectedContextPointId: string;
  direction: "depends_on" | "consumes" | "validates" | "unknown";
  breakageRisk: string;
  evidence: string[];
};

export type EvidenceClaim = {
  claim: string;
  evidence: string[];
  confidence: "evidence-backed" | "inferred" | "unknown";
};

export type ContextGraph = {
  version: 1;
  artifact: "agentCtx_graph";
  nodes: ContextGraphNode[];
  edges: ContextGraphEdge[];
  commands: ContextGraphCommand[];
};

export type ContextGraphNode = {
  id: string;
  name: string;
  type: string;
  primary_paths: string[];
  related_paths: string[];
  languages: string[];
  frameworks: string[];
  artifact: string;
  risk_level: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
};

export type ContextGraphEdge = {
  from: string;
  to: string;
  relationship: "depends_on" | "consumes" | "validates" | "unknown";
  interface: string;
  risk: string;
  evidence: string[];
};

export type ContextGraphCommand = {
  id: string;
  context_point: string;
  command: string;
  purpose: string;
  evidence: string;
};

export type ContextArtifact = {
  path: string;
  content: string;
};

export type BuildMetrics = {
  durationMs: number;
  filesScanned: number;
  filesSkipped: number;
  contextPointsDiscovered: number;
  artifactsWritten: number;
  generatedCharacters: number;
  estimatedTokens: number;
  largestArtifactPath?: string;
  largestArtifactCharacters?: number;
};

export type ContextUsefulnessScore = {
  contextPointId: string;
  score: number;
  checks: {
    hasPurpose: boolean;
    hasScope: boolean;
    hasStartHere: boolean;
    hasCommandsOrUnknowns: boolean;
    hasDoneWhen: boolean;
    hasEvidence: boolean;
  };
};
