import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      'virtual:pwa-register': fileURLToPath(
        new URL('./src/test/mocks/pwaRegister.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    restoreMocks: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
