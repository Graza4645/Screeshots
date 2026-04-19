// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

// Load environment variables from single .env file
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,  // Auto-retry failed tests once locally, twice in CI
  workers: 10,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list']
  ],
  use: {
    headless: true,
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    viewport: null,           // Full screen — uses entire browser window
    launchOptions: {
      args: ['--start-maximized'],  // Launch browser maximized
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
