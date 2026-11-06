import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths: the build works under any GitHub Pages sub-path (/<repo>/).
  base: './',
  server: { port: 5173, strictPort: true },
  test: {
    include: ['tests/**/*.test.js'],
  },
})
