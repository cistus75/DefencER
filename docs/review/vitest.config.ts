import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Opt-in review probes; deliberately outside the normal *.test.* suite.
export default defineConfig({
  root: fileURLToPath(new URL('../..', import.meta.url)),
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['docs/review/system-probes.tsx'],
  },
})
