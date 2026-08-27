import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Evita CORS en dev: el frontend pide rutas relativas ('/api/...') y Vite las
    // reenvía al backend (CLAUDE.md: backend en el puerto 3001).
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
