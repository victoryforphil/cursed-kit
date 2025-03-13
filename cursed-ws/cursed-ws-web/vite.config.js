import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow connections from any IP
    host: '0.0.0.0',
    
    // Configure proxy for development
    proxy: {
      '/spam': {
        target: 'http://cursed-ws-bridge:3030',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
