import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: fileURLToPath(new URL('./example', import.meta.url)),
  // Relative asset URLs, so the built playground works both at the root of a
  // local preview and under the /react-timesheet/ path on GitHub Pages.
  base: './',
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
