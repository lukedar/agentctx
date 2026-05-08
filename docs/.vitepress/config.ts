import { defineConfig } from 'vitepress'

export default defineConfig({
  // For GitHub Pages, set VITEPRESS_BASE="/your-repo/" in the workflow.
  base: process.env.VITEPRESS_BASE ?? '/',
  lang: 'en-US',
  title: 'dual-agent-runner',
  description: 'A reusable dual-agent (Builder/Evaluator) runner framework for high-quality engineering work.',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Scoring', link: '/scoring' },
      { text: 'UI', link: '/ui' },
      { text: 'API', link: '/api' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Getting started', link: '/getting-started' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Prompts', link: '/prompts' },
        ],
      },
      {
        text: 'Quality guardrails',
        items: [
          { text: 'Scoring rubric', link: '/scoring' },
          { text: 'Security', link: '/security' },
          { text: 'Performance', link: '/performance' },
          { text: 'Token usage', link: '/token-usage' },
        ],
      },
      {
        text: 'UI',
        items: [{ text: 'Runner UI', link: '/ui' }],
      },
      {
        text: 'Reference',
        items: [{ text: 'API', link: '/api' }],
      },
    ],
  },
})
