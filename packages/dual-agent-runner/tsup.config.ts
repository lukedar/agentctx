import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  platform: 'node',
  esbuildOptions(options) {
    options.banner = options.banner ?? {}
    // Ensures the npm bin works when executed directly.
    options.banner.js = '#!/usr/bin/env node'
  },
})
