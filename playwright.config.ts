import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const isNightly = process.env.E2E_NIGHTLY === '1';

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html', { outputFolder: './e2e/playwright-report' }], ['github']]
    : [['html', { outputFolder: './e2e/playwright-report', open: 'never' }]],

  snapshotPathTemplate:
    '{snapshotDir}/{testFileDir}/__snapshots__/{testFileName}/{arg}-{projectName}{ext}',

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    },
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // CI baseline: 3 viewports (desktop, mobile, tablet)
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Mini'] },
    },
    // Nightly only: additional mobile viewports
    ...(isNightly
      ? [
          {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 7'] },
          },
          {
            name: 'mobile-small',
            use: { ...devices['iPhone SE'] },
          },
        ]
      : []),
  ],

  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
