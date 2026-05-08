import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Keep 4318 for the SSE server.
    port: 4319,
    strictPort: false,
  },
})
