import {
  buildGraph,
  createRepoFileIndex,
  contextFileRegistry,
  detectContextFileCapabilities,
  extractFacts,
  getContextFileDefinition,
  loadConfig,
  selectContextFiles,
  type AgentCtxConfig,
  type ContextFileCapability,
  type ContextFileDefinition,
} from '@agentctx/core'
import { mvpPlugins } from '@agentctx/adapters'

import { createPointConfig, normalizePointName } from './points'

export type ContextFilePlanItem = Readonly<{
  name: string
  category: string
  selected: boolean
  reason: string
  publicSafe: boolean
  maxTokens: number
}>

export type ContextFilePlanResult = Readonly<{
  config: AgentCtxConfig
  point?: string
  capabilities: readonly ContextFileCapability[]
  files: readonly ContextFilePlanItem[]
}>

const configForPoint = (workspaceConfig: AgentCtxConfig, pointName?: string): AgentCtxConfig => {
  if (!pointName) return workspaceConfig
  const normalized = normalizePointName(pointName)
  const point = workspaceConfig.ctxPoints.find((candidate) => normalizePointName(candidate.name) === normalized)
  if (!point) throw new Error(`Unknown CtxPoint: ${normalized}`)
  return createPointConfig(workspaceConfig, point)
}

const loadGraph = async (config: AgentCtxConfig) => {
  const indexRes = await createRepoFileIndex(config)
  if (!indexRes.ok) throw new Error(indexRes.error.message)
  const factsRes = await extractFacts({ config, files: indexRes.value, plugins: mvpPlugins })
  if (!factsRes.ok) throw new Error(factsRes.error.message)
  return buildGraph(factsRes.value, config)
}

const explainSelection = (
  definition: ContextFileDefinition,
  selected: boolean,
  capabilities: readonly ContextFileCapability[],
): string => {
  if (!selected) return definition.requiredCapabilities.length
    ? `missing capabilities: ${definition.requiredCapabilities.filter((capability) => !capabilities.includes(capability)).join(', ')}`
    : 'not selected for this scope'
  if (definition.category === 'core') return 'universal context file'
  if (definition.category === 'root') return 'workspace context file'
  return definition.requiredCapabilities.length
    ? `required capabilities detected: ${definition.requiredCapabilities.join(', ')}`
    : 'selected by configuration'
}

export const createContextFilePlan = async (input: {
  cwd: string
  point?: string
}): Promise<ContextFilePlanResult> => {
  return createContextFilePlanItems(input)
}

export const createContextFilePlanItems = async (input: {
  cwd: string
  point?: string
}): Promise<ContextFilePlanResult> => {
  const cfgRes = await loadConfig(input.cwd)
  if (!cfgRes.ok) throw new Error(cfgRes.error.message)
  const config = configForPoint(cfgRes.value, input.point)
  const graph = await loadGraph(config)
  const capabilities = detectContextFileCapabilities(graph, config)
  const selectedDefinitions = selectContextFiles({ graph, config, capabilities })
  const selected = new Set(selectedDefinitions.map((item) => item.name))

  return {
    config,
    ...(input.point ? { point: normalizePointName(input.point) } : {}),
    capabilities,
    files: contextFileRegistry.map((definition) => ({
      name: definition.name,
      category: definition.category,
      selected: selected.has(definition.name),
      reason: explainSelection(definition, selected.has(definition.name), capabilities),
      publicSafe: definition.publicSafe,
      maxTokens: definition.maxTokens,
    })),
  }
}

export const explainContextFile = async (input: {
  cwd: string
  point?: string
  file: string
}): Promise<ContextFilePlanItem> => {
  const definition = getContextFileDefinition(input.file)
  if (!definition) throw new Error(`Unknown context file: ${input.file}`)
  const plan = await createContextFilePlanItems({ cwd: input.cwd, ...(input.point ? { point: input.point } : {}) })
  const item = plan.files.find((candidate) => candidate.name === input.file)
  if (item) return item

  return {
    name: definition.name,
    category: definition.category,
    selected: false,
    reason: explainSelection(definition, false, plan.capabilities),
    publicSafe: definition.publicSafe,
    maxTokens: definition.maxTokens,
  }
}
