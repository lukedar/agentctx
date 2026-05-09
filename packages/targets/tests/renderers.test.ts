import { describe, expect, it } from 'vitest'

import type { AgentCtxConfig, ContextGraph, RenderedContextBlock, TargetRenderInput } from '@agentctx/core'

import { agentsMdTarget } from '../src/agentsMd'
import { claudeTarget } from '../src/claude'
import { copilotTarget } from '../src/copilot'
import { cursorTarget } from '../src/cursor'
import { llmsTarget } from '../src/llms'

const config: AgentCtxConfig = {
  rootDir: '/repo',
  scope: { kind: 'workspace' },
  contextPoints: [],
  targets: ['agents-md', 'claude', 'cursor', 'copilot', 'llms'],
  include: [],
  exclude: [],
  contextBlocks: {
    architecture: true,
    conventions: true,
    runtime: true,
    api: true,
    database: true,
    frontend: true,
    testing: true,
    workflows: true,
    glossary: true,
  },
  budgets: {
    default: 'medium',
    small: 4000,
    medium: 12000,
    large: 32000,
  },
  drift: {
    failOnCheck: true,
    thresholdPercent: 10,
  },
  security: {
    redactSecrets: true,
    includeEnvValues: false,
    allowSourceSnippets: false,
  },
}

const graph: ContextGraph = {
  rootDir: '/repo',
  facts: [],
  apps: [],
  packages: [],
  relationships: [],
  contextBlocks: {},
}

const contextBlocks: readonly RenderedContextBlock[] = [
  { name: 'architecture', title: 'Architecture', content: '# Architecture\n\n- summary\n', tokenEstimate: 5 },
  { name: 'conventions', title: 'Conventions', content: '# Conventions\n\n- rules\n', tokenEstimate: 5 },
  { name: 'testing', title: 'Testing', content: '# Testing\n\n- tests\n', tokenEstimate: 5 },
  { name: 'workflows', title: 'Workflows', content: '# Workflows\n\n- build\n', tokenEstimate: 5 },
  { name: 'glossary', title: 'Glossary', content: '# Glossary\n\n- TERM\n', tokenEstimate: 5 },
]

const input: TargetRenderInput = { config, graph, contextBlocks }

describe('target renderers', () => {
  it('renders AGENTS.md with context links and generated block markers', async () => {
    const [file] = await agentsMdTarget.render(input)
    expect(file.path).toBe('AGENTS.md')
    expect(file.content).toContain('<!-- agentctx:start -->')
    expect(file.content).toContain('Agent Instructions')
    expect(file.content).toContain('- Architecture: `.agentctx/context/architecture.md`')
    expect(file.content).toContain('# Workflows')
  })

  it('renders CLAUDE.md with architecture and workflow sections', async () => {
    const [file] = await claudeTarget.render(input)
    expect(file.path).toBe('CLAUDE.md')
    expect(file.content).toContain('Claude Project Context')
    expect(file.content).toContain('# Architecture')
    expect(file.content).toContain('# Workflows')
  })

  it('renders Copilot instructions into the GitHub path', async () => {
    const [file] = await copilotTarget.render(input)
    expect(file.path).toBe('.github/copilot-instructions.md')
    expect(file.content).toContain('Copilot instructions')
    expect(file.content).toContain('# Conventions')
  })

  it('renders Cursor rules with frontmatter and generated block content', async () => {
    const [file] = await cursorTarget.render(input)
    expect(file.path).toBe('.cursor/rules/project.mdc')
    expect(file.content).toContain('description: Project-wide coding rules')
    expect(file.content).toContain('<!-- agentctx:start -->')
    expect(file.content).toContain('Run typecheck and tests before finalizing changes.')
  })

  it('renders llms.txt with output index and generated note', async () => {
    const [file] = await llmsTarget.render(input)
    expect(file.path).toBe('llms.txt')
    expect(file.content).toContain('Project index')
    expect(file.content).toContain('AGENTS.md')
    expect(file.content).toContain('Generated automatically')
  })
})
