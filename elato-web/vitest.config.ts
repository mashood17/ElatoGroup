import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Separate from vite.config.ts on purpose: keeps the dev-server config (port
// env override, etc.) untouched by test-only concerns like jsdom/setup files.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    pool: 'threads',
    // This machine runs multiple concurrent git worktrees/agents (other dev
    // servers, tsc -b, npm builds) competing for CPU — spawning many worker
    // threads in parallel here was timing out ("Timeout waiting for worker
    // to respond") under that contention. A single worker is slower but
    // reliable.
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
      include: ['src/lib/**', 'src/components/**'],
    },
  },
})
