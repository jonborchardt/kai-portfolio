import { defineConfig, devices } from "@playwright/test";

// A port of its own, so the tests never talk to a dev server left running on
// Astro's default port. The path must match `base` in astro.config.ts.
const port = 4331;
const baseURL = `http://localhost:${port}/kai-portfolio/`;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
  },
});
