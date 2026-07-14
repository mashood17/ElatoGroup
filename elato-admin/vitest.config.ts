import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Separate from vite.config.ts on purpose — mirrors elato-web's setup, see
// that file's comment for why.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    pool: 'threads',
    // This machine runs multiple concurrent git worktrees/agents competing
    // for CPU — spawning many worker threads in parallel was timing out
    // under that contention (see elato-web/vitest.config.ts for the same
    // fix). A single worker is slower but reliable.
    singleThread: true,
    testTimeout: 20_000,
    hookTimeout: 20_000,
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**'],
    },
  },
})
