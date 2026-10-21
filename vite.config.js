import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import geminiGuide from './server/gemini.js'

const root = import.meta.dirname

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), geminiGuide({ apiKey: env.GEMINI_API_KEY })],
    server: {
      port: 5175,
      strictPort: true,
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(root, 'index.html'),
          museum: resolve(root, 'museum.html'),
        },
      },
    },
  }
})
