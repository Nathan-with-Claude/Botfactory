import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright — DocuPost E2E Tests
 *
 * Prerequis pour lancer les tests :
 *   1. Backend : cd src/backend/svc-tournee && mvn spring-boot:run -Dspring-boot.run.profiles=dev
 *   2. Frontend : cd src/mobile && npx expo start --web --port 8082
 *   3. Tests : npx playwright test --project=chromium
 */
export default defineConfig({
  testDir: './src/mobile/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-results.json' }],
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
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 5'],
        // Simule un ecran Android pour l'app mobile web
      },
    },
  ],
  // Pas de webServer car les serveurs sont demarres manuellement
  // (backend Java + Expo Web)
});
