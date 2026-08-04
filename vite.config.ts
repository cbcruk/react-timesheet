import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: fileURLToPath(new URL('./example', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      'react-timesheet': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./example/dist', import.meta.url)),
    emptyOutDir: true,
  },
})
