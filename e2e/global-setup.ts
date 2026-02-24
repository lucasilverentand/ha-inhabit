import { chromium, type FullConfig } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const HA_URL = "http://localhost:8123";
const AUTH_DIR = path.join(__dirname, ".auth");
const STATE_FILE = path.join(AUTH_DIR, "state.json");

const HA_USER = "dev";
const HA_PASSWORD = "dev";

async function waitForHA(timeoutMs = 120_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${HA_URL}/api/`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok || res.status === 401) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(
    `Home Assistant not reachable at ${HA_URL} within ${timeoutMs}ms`
  );
}

/**
 * Authenticate via HA's REST auth flow and return OAuth tokens.
 * 1. POST /auth/login_flow  → start flow
 * 2. POST /auth/login_flow/{id} with credentials → get auth code
 * 3. POST /auth/token with code → get access + refresh tokens
 */
async function getHATokens(): Promise<{
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}> {
  // Step 1: Start the login flow
  const flowRes = await fetch(`${HA_URL}/auth/login_flow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: `${HA_URL}/`,
      handler: ["homeassistant", null],
      redirect_uri: `${HA_URL}/?auth_callback=1`,
    }),
  });
  if (!flowRes.ok) {
    throw new Error(`Failed to start login flow: ${flowRes.status}`);
  }
  const flow = await flowRes.json();

  // Step 2: Submit credentials
  const submitRes = await fetch(`${HA_URL}/auth/login_flow/${flow.flow_id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: `${HA_URL}/`,
      username: HA_USER,
      password: HA_PASSWORD,
    }),
  });
  if (!submitRes.ok) {
    throw new Error(`Failed to submit credentials: ${submitRes.status}`);
  }
  const result = await submitRes.json();
  const code = result.result;
  if (!code) {
    throw new Error(
      `Login flow did not return auth code: ${JSON.stringify(result)}`
    );
  }

  // Step 3: Exchange auth code for tokens
  const tokenRes = await fetch(`${HA_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: `${HA_URL}/`,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Failed to exchange token: ${tokenRes.status}`);
  }
  return tokenRes.json();
}

export default async function globalSetup(_config: FullConfig): Promise<void> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  await waitForHA();

  // Get tokens via REST API
  const tokens = await getHATokens();

  // Launch browser, inject tokens into localStorage, save state
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to HA so localStorage is on the right origin
  // HA will redirect to /auth/authorize — wait for that to settle
  await page.goto(HA_URL, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  // Inject hassTokens into localStorage (same format HA frontend uses)
  await page.evaluate(
    (t) => {
      const hassTokens = {
        hassUrl: "http://localhost:8123",
        clientId: "http://localhost:8123/",
        access_token: t.access_token,
        refresh_token: t.refresh_token,
        token_type: t.token_type,
        expires_in: t.expires_in,
        expires: Date.now() + t.expires_in * 1000,
      };
      localStorage.setItem("hassTokens", JSON.stringify(hassTokens));
    },
    tokens
  );

  // Verify the tokens work — navigate and check we land on the dashboard
  await page.goto(HA_URL);
  await page.waitForTimeout(3000);

  const url = page.url();
  if (url.includes("/auth/")) {
    throw new Error(
      `Auth injection failed — still on login page: ${url}`
    );
  }

  // Save storage state for test reuse
  await context.storageState({ path: STATE_FILE });

  await browser.close();
}
