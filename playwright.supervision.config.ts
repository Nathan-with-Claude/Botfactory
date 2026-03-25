import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright — DocuPost E2E Tests Supervision Web
 *
 * Prerequis :
 *   1. Backend svc-supervision : cd src/backend/svc-supervision && mvn spring-boot:run -Dspring-boot.run.profiles=dev
 *   2. Tests : npx playwright test --config=playwright.supervision.config.ts --project=chromium
 */
export default defineConfig({
  testDir: './src/web/supervision/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-supervision', open: 'never' }],
    ['json', { outputFile: 'playwright-results-supervision.json' }],
  ],
  use: {
    baseURL: 'http://localhost:8082',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
