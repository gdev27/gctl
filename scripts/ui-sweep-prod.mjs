/**
 * Production UI sweep for gctl.vercel.app — run: npx playwright install chromium && node scripts/ui-sweep-prod.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.UI_SWEEP_BASE || "https://gctl.vercel.app";
const issues = [];
const log = (...a) => console.log(...a);

function note(path, msg, extra = "") {
  issues.push({ path, msg, extra });
  log(`FAIL [${path}] ${msg}`, extra || "");
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  ignoreHTTPSErrors: true,
});

const consoleErrors = [];
context.on("page", (page) => {
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push({ url: page.url(), text: msg.text() });
  });
  page.on("pageerror", (err) => {
    consoleErrors.push({ url: page.url(), text: err.message });
  });
});

async function visit(path, fn) {
  const page = await context.newPage();
  const url = `${BASE}${path}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForTimeout(2000);
    const root = await page.locator("#root").count();
    const bodyText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
    if (bodyText.length < 20) note(path, "body text very short", bodyText.slice(0, 200));
    if (fn) await fn(page);
  } catch (e) {
    note(path, e.message || String(e));
  } finally {
    await page.close();
  }
}

log("UI sweep base:", BASE);

await visit("/", async (page) => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
});
await visit("/docs");
await visit("/concepts");
await visit("/dashboard", async (page) => {
  for (const label of ["Metrics", "Performance", "Overview"]) {
    const btn = page.getByRole("button", { name: label });
    if (await btn.count()) await btn.click().catch(() => {});
    await page.waitForTimeout(400);
  }
});
await visit("/onboarding");
await visit("/dashboard/agents", async (page) => {
  const newBtn = page.getByRole("button", { name: /new agent/i });
  if (await newBtn.count()) {
    await newBtn.first().click().catch(() => {});
    await page.waitForTimeout(800);
    const dialog = page.getByRole("dialog");
    if (await dialog.count()) await page.keyboard.press("Escape");
  }
});
await visit("/policy-builder", async (page) => {
  const debate = page.getByRole("button", { name: /debate|ai/i }).first();
  if (await debate.count()) {
    await debate.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape").catch(() => {});
  }
});
await visit("/playground");
await visit("/swarm");
await visit("/alerting");
await visit("/explorer");
await visit("/team", async (page) => {
  const inv = page.getByRole("button", { name: /invite/i });
  if (await inv.count()) {
    await inv.first().click().catch(() => {});
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape").catch(() => {});
  }
});
await visit("/nope-route-404-test");
await visit("/dashboard", async (page) => {
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyK");
  await page.keyboard.up("Control");
  await page.waitForTimeout(600);
  await page.keyboard.press("Escape").catch(() => {});
});

// Mobile width
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
const mp = await mobile.newPage();
try {
  await mp.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await mp.waitForTimeout(2000);
} catch (e) {
  note("/dashboard (mobile)", e.message);
}
await mobile.close();

await browser.close();

const severe = consoleErrors.filter((e) => {
  const t = e.text;
  if (/favicon|ResizeObserver|Failed to load resource.*404/i.test(t)) return false;
  if (/Refused to load the stylesheet.*fonts\.googleapis\.com/i.test(t)) return false;
  if (/DialogContent` requires a `DialogTitle`/i.test(t)) return false;
  return true;
});
if (severe.length) {
  log("\nConsole / page errors (filtered len:", severe.length, ")");
  for (const e of severe.slice(0, 25)) log(" ", e.url, "|", e.text.slice(0, 200));
}

log("\n--- Summary ---");
log("Hard failures:", issues.length);
if (issues.length) console.log(JSON.stringify(issues, null, 2));
if (issues.length || severe.length > 0) process.exitCode = 1;
else log("PASS: all routes loaded; no excessive console errors.");
