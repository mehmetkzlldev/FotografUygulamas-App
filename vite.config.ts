import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/FotografUygulamas-App/' : '/', // GitHub Pages için repo adı (sadece production)
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})

