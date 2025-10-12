import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  resolve: {
    alias: {
      // Fix: Use process.cwd() to avoid issues with __dirname not being defined in some TypeScript/ESM configurations.
      // FIX: Corrected a TypeScript type error with `process.cwd()` by using a relative path.
      '@': path.resolve('./src'),
    },
  },
})