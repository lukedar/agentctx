import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import RunnerArchitectureDiagram from './components/RunnerArchitectureDiagram.vue'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('RunnerArchitectureDiagram', RunnerArchitectureDiagram)
  },
} satisfies Theme
