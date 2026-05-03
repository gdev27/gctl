/**
 * Rasterize web/public/cover.svg to web/public/cover-640x360.png (640×360, 16:9).
 * Uses Playwright (devDependency) for consistent cross-platform output.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const W = 640;
const H = 360;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const svgPath = path.join(root, "web/public/cover.svg");
const outPath = path.join(root, "web/public/cover-640x360.png");

const svg = readFileSync(svgPath, "utf8");
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
});
await page.setContent(
  `<!DOCTYPE html><html><head><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #0c0e12; }
    img { display: block; width: ${W}px; height: ${H}px; }
  </style></head><body>
    <img src="${dataUrl}" alt="" width="${W}" height="${H}" />
  </body></html>`,
  { waitUntil: "networkidle" }
);
await page.locator("img").screenshot({ path: outPath, type: "png" });
await browser.close();

console.log("Wrote", path.relative(root, outPath));
