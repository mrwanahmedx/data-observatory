import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4186',
    headless: true
  },
  webServer: {
    command: 'node serve.mjs',
    url: 'http://127.0.0.1:4186',
    reuseExistingServer: false,
    timeout: 20_000
  }
});
