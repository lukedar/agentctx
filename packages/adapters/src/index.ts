export * from './plugins/packageManager'
export * from './plugins/packageMetadata'
export * from './plugins/packageDependencies'
export * from './plugins/workspace'
export * from './plugins/languageTs'
export * from './frameworkAdapters'
export * from './plugins/frameworksFromPackageJson'
export * from './plugins/testRunnersFromPackageJson'
export * from './plugins/envExample'
export * from './plugins/configFiles'
export * from './plugins/packageScripts'
export * from './plugins/apiDatabaseFiles'
export * from './plugins/routesFromFiles'
export * from './plugins/domainFiles'
export * from './plugins/operationalFrameworkFacts'

import type { AgentCtxPlugin } from '@agentctx/core'

import { apiDatabaseFilesPlugin } from './plugins/apiDatabaseFiles'
import { configFilesPlugin } from './plugins/configFiles'
import { domainFilesPlugin } from './plugins/domainFiles'
import { envExamplePlugin } from './plugins/envExample'
import { frameworkAdaptersPlugin } from './frameworkAdapters'
import { operationalFrameworkFactsPlugin } from './plugins/operationalFrameworkFacts'
import { packageDependenciesPlugin } from './plugins/packageDependencies'
import { packageMetadataPlugin } from './plugins/packageMetadata'
import { packageManagerPlugin } from './plugins/packageManager'
import { packageScriptsPlugin } from './plugins/packageScripts'
import { routesFromFilesPlugin } from './plugins/routesFromFiles'
import { testRunnersFromPackageJsonPlugin } from './plugins/testRunnersFromPackageJson'
import { typescriptPlugin } from './plugins/languageTs'
import { workspacePlugin } from './plugins/workspace'

export const mvpPlugins: readonly AgentCtxPlugin[] = [
  packageManagerPlugin,
  packageMetadataPlugin,
  packageDependenciesPlugin,
  workspacePlugin,
  typescriptPlugin,
  frameworkAdaptersPlugin,
  operationalFrameworkFactsPlugin,
  testRunnersFromPackageJsonPlugin,
  packageScriptsPlugin,
  routesFromFilesPlugin,
  configFilesPlugin,
  apiDatabaseFilesPlugin,
  domainFilesPlugin,
  envExamplePlugin,
]
