import { defineConfig, devices } from '@playwright/test'

const backendPort = Number(process.env.E2E_BACKEND_PORT ?? 3317)
const frontendPort = Number(process.env.E2E_FRONTEND_PORT ?? 5187)
const reuseExistingServer = process.env.E2E_REUSE_EXISTING_SERVER === 'true'

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
      command: `env PORT=${backendPort} NODE_ENV=development ALLOW_ANONYMOUS_HOUSEHOLD=true CORS_ALLOWED_ORIGINS=http://127.0.0.1:${frontendPort},http://localhost:${frontendPort} bun run dev`,
      cwd: '../DuYuTho_n',
      reuseExistingServer,
      timeout: 120_000,
      url: `http://127.0.0.1:${backendPort}/api/health`,
    },
    {
      command: `env VITE_API_BASE_URL=http://127.0.0.1:${backendPort} VITE_CLERK_PUBLISHABLE_KEY= VITE_ALLOW_ANONYMOUS_BACKEND=true bun run dev -- --host 127.0.0.1 --port ${frontendPort} --strictPort`,
      reuseExistingServer,
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
