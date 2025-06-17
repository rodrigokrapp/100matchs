import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      external: (id) => {
        return id.includes('@rollup/rollup-')
      }
    }
  },
  optimizeDeps: {
    exclude: [
      '@rollup/rollup-linux-x64-gnu',
      '@rollup/rollup-linux-x64-musl',
      '@rollup/rollup-darwin-x64',
      '@rollup/rollup-darwin-arm64',
      '@rollup/rollup-win32-x64-msvc'
    ],
    include: ['esbuild']
  },
  esbuild: {
    target: 'esnext'
  },
  define: {
    global: 'globalThis',
  }
}) 