export default {
  targets: ["agents-md", "claude", "cursor", "copilot", "llms"],
  ctxPoints: [
    { name: "core", path: "packages/core", type: "package" },
    { name: "cli", path: "packages/cli", type: "package", dependsOn: ["core", "adapters", "targets"] },
    { name: "adapters", path: "packages/adapters", type: "package", dependsOn: ["core"] },
    { name: "targets", path: "packages/targets", type: "package", dependsOn: ["core"] },
    { name: "dual-agent-runner", path: "packages/dual-agent-runner", type: "package" },
    { name: "docs-agentctx", path: "docs-agentctx", type: "docs" }
  ]
}
