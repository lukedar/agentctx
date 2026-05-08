import path from 'node:path'

export const resolveCwd = (cwdFlag?: string): string =>
  cwdFlag ? path.resolve(process.cwd(), cwdFlag) : process.cwd()

export const agentctxDir = (rootDir: string): string => path.join(rootDir, '.agentctx')
export const cacheDir = (rootDir: string): string => path.join(agentctxDir(rootDir), 'cache')

// Legacy MVP paths (kept for backwards compatibility)
export const contextDir = (rootDir: string): string => path.join(agentctxDir(rootDir), 'context')
export const outDir = (rootDir: string): string => path.join(agentctxDir(rootDir), 'out')

// Post-MVP layout
export const workspaceDir = (rootDir: string): string => path.join(agentctxDir(rootDir), 'workspace')
export const workspaceContextDir = (rootDir: string): string => path.join(workspaceDir(rootDir), 'context')
export const workspaceOutDir = (rootDir: string): string => path.join(workspaceDir(rootDir), 'out')

export const pointsDir = (rootDir: string): string => path.join(agentctxDir(rootDir), 'points')
export const pointDir = (rootDir: string, pointName: string): string =>
  path.join(pointsDir(rootDir), pointName)
export const pointContextDir = (rootDir: string, pointName: string): string =>
  path.join(pointDir(rootDir, pointName), 'context')
export const pointOutDir = (rootDir: string, pointName: string): string =>
  path.join(pointDir(rootDir, pointName), 'out')
