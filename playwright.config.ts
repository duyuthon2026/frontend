import { defineConfig, devices } from '@playwright/test'

const backendPort = 3000
const frontendPort = 5173

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: [['list']],
  testDir: './e2e',
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: `env NODE_ENV=development ALLOW_ANONYMOUS_HOUSEHOLD=true CORS_ALLOWED_ORIGINS=http://127.0.0.1:${frontendPort},http://localhost:${frontendPort} bun run dev`,
      cwd: '../DuYuTho_n',
      reuseExistingServer: true,
      timeout: 120_000,
      url: `http://127.0.0.1:${backendPort}/api/health`,
    },
    {
      command: `env VITE_API_BASE_URL=http://127.0.0.1:${backendPort} bun run dev -- --host 127.0.0.1`,
      reuseExistingServer: true,
      timeout: 120_000,
      url: `http://127.0.0.1:${frontendPort}`,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
