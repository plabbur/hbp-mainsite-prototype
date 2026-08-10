// Headless diagnostic: samples the foreground camera transform during the
// load intro and the scroll plunge, and reports section visibility.
import { chromium } from "playwright";

const read = () => {
  const fg = document.querySelector("#scene-fg");
  const section = document.querySelector("#section-about");
  const sectionStyle = getComputedStyle(section);
  return {
    x: Number(window.gsap.getProperty(fg, "x").toFixed(2)),
    y: Number(window.gsap.getProperty(fg, "y").toFixed(2)),
    scale: Number(window.gsap.getProperty(fg, "scale").toFixed(4)),
    sectionOpacity: sectionStyle.opacity,
    sectionVisibility: sectionStyle.visibility,
    sectionDisplay: sectionStyle.display,
    scrollY: window.scrollY,
  };
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (msg) => console.log("[console]", msg.text()));
page.on("pageerror", (err) => console.log("[pageerror]", err.message));

await page.goto("http://localhost:4173", { waitUntil: "load" });

console.log("== intro samples ==");
for (const ms of [300, 1500, 3000, 5000, 6800]) {
  await page.waitForTimeout(ms === 300 ? 300 : ms - (await page.evaluate(() => window.__lastSample ?? 0)));
  await page.evaluate((now) => (window.__lastSample = now), ms);
  console.log(`t=${ms}ms`, JSON.stringify(await page.evaluate(read)));
}

console.log("== scroll samples ==");
const max = await page.evaluate(
  () => document.documentElement.scrollHeight - innerHeight,
);
for (const p of [0.2, 0.45, 0.679, 0.75, 0.84, 0.92, 1]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * p));
  await page.waitForTimeout(1200);
  console.log(`progress=${p}`, JSON.stringify(await page.evaluate(read)));
}

await page.screenshot({ path: "/tmp/check-end.png" });
await browser.close();
console.log("done");
