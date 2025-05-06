import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    'process.env': {}
  },
  plugins: [
    react()
  ],
  server: {
    port: 3000,
    watch: {
      usePolling: true
    }
  }
}) 