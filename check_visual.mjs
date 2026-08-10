import { chromium } from "playwright";

const SPAN = 44;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (err) => console.log("[pageerror]", err.message));
await page.goto("http://localhost:4173", { waitUntil: "load" });
await page.waitForTimeout(7200);

const max = await page.evaluate(
  () => document.documentElement.scrollHeight - innerHeight,
);
for (const [label, T, settle] of [
  ["sponsors", 34.6, 2800],
  ["team-reveal", 38.2, 900],
  ["team", 39.8, 2400],
  ["team-later", 39.8, 2400],
  ["team-exit", 42.0, 1400],
  ["blank", 43.7, 1600],
]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round((max * T) / SPAN));
  await page.waitForTimeout(settle);
  await page.screenshot({ path: `/tmp/stage-${label}.png` });
  console.log("captured", label);
}

await browser.close();
console.log("done");
