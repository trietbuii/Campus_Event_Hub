import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@backend': path.resolve(import.meta.dirname, '../backend'),
      '@data': path.resolve(import.meta.dirname, '../data'),
    },
  },
  server: {
    port: 8443,
    strictPort: true,
  },
  preview: {
    port: 8443,
  },
})
