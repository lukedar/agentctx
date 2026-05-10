import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import BenchmarkResultsTable from './components/BenchmarkResultsTable.vue'
import DualAgentMetricsTable from './components/DualAgentMetricsTable.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('BenchmarkResultsTable', BenchmarkResultsTable)
    ctx.app.component('DualAgentMetricsTable', DualAgentMetricsTable)
  },
} satisfies Theme
