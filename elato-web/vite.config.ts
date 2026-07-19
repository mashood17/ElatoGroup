import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Splits the framework/animation runtime (which changes far less
        // often than app code) into its own long-term-cacheable chunks —
        // pure build-output change, doesn't affect what loads on which
        // route or when (dynamic-import chunks like PremiumLogoScene keep
        // loading exactly as before).
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[\\/](react|react-dom|react-router-dom|scheduler)[\\/]/.test(id)) return 'vendor-react'
            if (id.includes('framer-motion')) return 'vendor-motion'
          }
        },
      },
    },
  },
})
