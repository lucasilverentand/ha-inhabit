import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/tests",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:8123",
    storageState: "./e2e/.auth/state.json",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
