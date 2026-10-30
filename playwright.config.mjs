// End-to-end tests against the built site (npm run test:e2e), at desktop and phone widths.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  outputDir: "test-results",
  use: { baseURL: "http://localhost:8130/", serviceWorkers: "block" },
  webServer: { command: "node scripts/serve.mjs", env: { PORT: "8130" }, url: "http://localhost:8130/", reuseExistingServer: false },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  ],
});
