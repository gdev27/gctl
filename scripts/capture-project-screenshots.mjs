/**
 * High-quality marketing / evidence screenshots (Playwright).
 * - prefers-reduced-motion so landing whileInView sections render fully
 * - scroll settle + fonts for long pages
 * - 2x device pixel ratio, 1920-wide viewport
 *
 * Prereq: dev server running, e.g. npm run web:dev
 *   npx playwright install chromium
 *   BASE=http://127.0.0.1:5173 node scripts/capture-project-screenshots.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || "http://127.0.0.1:5173";
const OUT = join(__dirname, "..", "docs", "evidence", "project-screenshots");

/** @type {{ path: string; file: string; fullPage?: boolean; tabClicks?: string[] }[]} */
const shots = [
  { path: "/", file: "01-landing.png", fullPage: true },
  { path: "/concepts", file: "02-concepts.png", fullPage: true },
  { path: "/docs", file: "03-docs.png", fullPage: true },
  {
    path: "/dashboard",
    file: "04-dashboard.png",
    fullPage: true,
    tabClicks: ["Metrics", "Performance"],
  },
  { path: "/policy-builder", file: "05-policy-builder.png", fullPage: true },
  { path: "/playground", file: "06-playground.png", fullPage: true },
];

async function settleScroll(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const h = window.innerHeight;
    const step = Math.max(280, Math.floor(h * 0.55));
    const maxY = Math.max(0, document.documentElement.scrollHeight - h);
    for (let y = 0; y <= maxY; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await delay(100);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await delay(150);
  });
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
  colorScheme: "dark",
  ignoreHTTPSErrors: true,
});

for (const shot of shots) {
  const page = await context.newPage();
  const url = `${BASE}${shot.path}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(shot.path === "/" ? 600 : 400);

  if (shot.path === "/") {
    await settleScroll(page);
    await page.waitForTimeout(400);
  }

  if (shot.tabClicks?.length) {
    for (const label of shot.tabClicks) {
      const btn = page.getByRole("button", { name: label });
      if (await btn.count()) await btn.first().click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(450);
    }
    const overview = page.getByRole("button", { name: "Overview" });
    if (await overview.count()) await overview.first().click().catch(() => {});
    await page.waitForTimeout(300);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);

  const fullPage = shot.fullPage !== false;
  await page.screenshot({
    path: join(OUT, shot.file),
    fullPage,
    animations: "disabled",
  });
  await page.close();
  console.log("wrote", join(OUT, shot.file));
}

await browser.close();
