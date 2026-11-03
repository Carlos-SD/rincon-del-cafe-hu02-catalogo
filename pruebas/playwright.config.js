import { defineConfig, devices } from '@playwright/test';

// URL de la app. En local y en el pipeline es el puerto 3000.
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // En CI falla si alguien deja un test.only olvidado.
  forbidOnly: !!process.env.CI,
  // Un reintento en CI para poder grabar el trace (on-first-retry).
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Playwright enciende la app si no está encendida. En el pipeline la app ya
  // la levantó un paso anterior, así que reuseExistingServer: true la reutiliza
  // en vez de intentar abrir un segundo servidor en el mismo puerto 3000.
  webServer: {
    command: 'npm start',
    cwd: '../app',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
